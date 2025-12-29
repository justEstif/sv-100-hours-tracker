<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { page } from "$app/state";
  import Navbar from "$lib/components/Navbar.svelte";
  import {
    getMilestone,
    updateMilestone,
    regenerateMilestoneFeedback,
  } from "$lib/log.remote";

  let { data } = $props();

  // Fetch milestone data
  let milestoneData = $derived(
    page.params.milestoneId
      ? await getMilestone(page.params.milestoneId)
      : null,
  );

  // Get milestone label based on threshold
  function getMilestoneLabel(threshold: number): string {
    switch (threshold) {
      case 25:
        return "Quarter Way";
      case 50:
        return "Halfway There";
      case 75:
        return "Three Quarters";
      case 100:
        return "Journey Complete";
      default:
        return `${threshold} Hours`;
    }
  }

  // Format date for display
  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<div class="min-h-screen bg-base-200">
  <Navbar user={data.user} />

  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if milestoneData}
      <div in:fade={{ duration: 300 }}>
        <!-- Back link -->
        <a
          href="/{page.params.commitmentId}"
          class="btn btn-ghost btn-sm gap-2 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to {milestoneData.commitment.title}
        </a>

        <!-- Page title -->
        <h1 class="text-3xl font-display font-bold mb-8">Edit Milestone</h1>

        <!-- Milestone info card -->
        <div
          class="card bg-base-100 mb-6 border-l-4 border-secondary"
          in:fly={{ y: 20, duration: 400, easing: cubicOut }}
        >
          <div class="card-body py-4">
            <div class="flex items-center gap-3">
              <div
                class="badge badge-secondary badge-lg font-display font-bold"
              >
                {milestoneData.hoursThreshold}h
              </div>
              <h3 class="font-display font-semibold">
                {getMilestoneLabel(milestoneData.hoursThreshold)}
              </h3>
              <span class="text-neutral text-sm ml-auto">
                Completed {formatDate(milestoneData.completedAt)}
              </span>
            </div>
          </div>
        </div>

        <!-- Edit form -->
        <div
          class="card bg-base-100"
          in:fly={{ y: 20, duration: 400, delay: 100, easing: cubicOut }}
        >
          <div class="card-body">
            <form {...updateMilestone} class="space-y-4">
              <!-- Hidden ID -->
              <input type="hidden" name="id" value={milestoneData.id} />

              <!-- User Synthesis -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Your Synthesis</legend>
                <textarea
                  {...updateMilestone.fields.userSynthesis.as("text")}
                  class="textarea w-full"
                  class:textarea-error={(updateMilestone.fields.userSynthesis.issues()
                    ?.length ?? 0) > 0}
                  rows="8"
                  placeholder="What have you learned? What surprised you? What do you want to focus on next?"
                  >{milestoneData.userSynthesis}</textarea
                >
                {#each updateMilestone.fields.userSynthesis.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Buttons -->
              <div class="flex gap-2">
                <button
                  type="submit"
                  disabled={!!updateMilestone.pending}
                  class="btn btn-primary"
                >
                  {#if updateMilestone.pending}
                    <span class="loading loading-spinner loading-sm"></span>
                    Saving...
                  {:else}
                    Save Changes
                  {/if}
                </button>
                <a href="/{page.params.commitmentId}" class="btn btn-ghost">
                  Cancel
                </a>
              </div>

              <!-- Form-level errors -->
              {#each updateMilestone.fields.allIssues() as issue}
                <div class="alert alert-error mt-4">
                  <span>{issue.message}</span>
                </div>
              {/each}
            </form>
          </div>
        </div>

        <!-- AI Feedback (separate card to avoid nested forms) -->
        <div
          class="card bg-base-100 mt-6"
          in:fly={{ y: 20, duration: 400, delay: 200, easing: cubicOut }}
        >
          <div class="card-body">
            <h3 class="text-lg font-display font-semibold mb-3">AI Feedback</h3>
            {#if milestoneData.aiFeedback}
              <div
                class="p-4 bg-secondary/10 rounded-lg border border-secondary/20"
              >
                <div class="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-secondary mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <p class="text-sm text-neutral italic">
                    {milestoneData.aiFeedback}
                  </p>
                </div>
              </div>
              <form {...regenerateMilestoneFeedback} class="mt-3">
                <input type="hidden" name="id" value={milestoneData.id} />
                <button
                  type="submit"
                  class="btn btn-ghost btn-sm gap-2"
                  disabled={!!regenerateMilestoneFeedback.pending}
                >
                  {#if regenerateMilestoneFeedback.pending}
                    <span class="loading loading-spinner loading-xs"></span>
                    Regenerating...
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Regenerate Feedback
                  {/if}
                </button>
              </form>
            {:else}
              <p class="text-neutral text-sm mb-3">
                No AI feedback yet. Generate personalized insights based on your
                synthesis and learning reflections.
              </p>
              <form {...regenerateMilestoneFeedback}>
                <input type="hidden" name="id" value={milestoneData.id} />
                <button
                  type="submit"
                  class="btn btn-secondary btn-sm gap-2"
                  disabled={!!regenerateMilestoneFeedback.pending}
                >
                  {#if regenerateMilestoneFeedback.pending}
                    <span class="loading loading-spinner loading-xs"></span>
                    Generating...
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Generate AI Feedback
                  {/if}
                </button>
              </form>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center py-16">
        <h2 class="text-xl font-display font-semibold mb-2">
          Milestone Not Found
        </h2>
        <p class="text-neutral mb-6">
          This milestone doesn't exist or you don't have permission to edit it.
        </p>
        <a href="/{page.params.commitmentId}" class="btn btn-primary">
          Go Back
        </a>
      </div>
    {/if}
  </main>
</div>
