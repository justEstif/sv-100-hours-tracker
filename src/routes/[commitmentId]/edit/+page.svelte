<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { page } from "$app/state";
  import Navbar from "$lib/components/Navbar.svelte";
  import { getCommitmentWithLogs, updateCommitment } from "$lib/log.remote";

  let { data } = $props();

  // Fetch commitment data
  let commitmentData = $derived(
    page.params.commitmentId
      ? await getCommitmentWithLogs(page.params.commitmentId)
      : null,
  );
</script>

<div class="min-h-screen bg-base-200">
  <Navbar user={data.user} />

  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if commitmentData}
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
          Back
        </a>

        <!-- Page title -->
        <h1 class="text-3xl font-display font-bold mb-8">Edit Commitment</h1>

        <!-- Edit form -->
        <div
          class="card bg-base-100"
          in:fly={{ y: 20, duration: 400, easing: cubicOut }}
        >
          <div class="card-body">
            <form {...updateCommitment} class="space-y-4">
              <!-- Hidden ID -->
              <input
                type="hidden"
                name="id"
                value={commitmentData.commitment.id}
              />

              <!-- Title -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Title</legend>
                <input
                  {...updateCommitment.fields.title.as("text")}
                  value={commitmentData.commitment.title}
                  class="input w-full"
                  class:input-error={(updateCommitment.fields.title.issues()
                    ?.length ?? 0) > 0}
                />
                {#each updateCommitment.fields.title.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Category -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Category (optional)</legend>
                <input
                  {...updateCommitment.fields.category.as("text")}
                  value={commitmentData.commitment.category ?? ""}
                  class="input w-full"
                  class:input-error={(updateCommitment.fields.category.issues()
                    ?.length ?? 0) > 0}
                  placeholder="e.g., Programming, Music, Art"
                />
                {#each updateCommitment.fields.category.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Goal Hours -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Goal Hours</legend>
                <input
                  {...updateCommitment.fields.goalHours.as("number")}
                  value={commitmentData.commitment.goalHours}
                  min="1"
                  max="1000"
                  class="input w-full max-w-xs"
                  class:input-error={(updateCommitment.fields.goalHours.issues()
                    ?.length ?? 0) > 0}
                />
                {#each updateCommitment.fields.goalHours.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Warning about milestone reset -->
              <div class="alert alert-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>Changing the goal hours will reset all milestones for this commitment.</span>
              </div>

              <!-- Buttons -->
              <div class="flex gap-2">
                <button
                  type="submit"
                  disabled={!!updateCommitment.pending}
                  class="btn btn-primary"
                >
                  {#if updateCommitment.pending}
                    <span class="loading loading-spinner loading-sm"></span>
                    Saving...
                  {:else}
                    Save Changes
                  {/if}
                </button>
                <a
                  href="/{page.params.commitmentId}"
                  class="btn btn-ghost"
                >
                  Cancel
                </a>
              </div>

              <!-- Form-level errors -->
              {#each updateCommitment.fields.allIssues() as issue}
                <div class="alert alert-error mt-4">
                  <span>{issue.message}</span>
                </div>
              {/each}
            </form>
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>
