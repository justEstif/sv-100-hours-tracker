<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { page } from "$app/state";
  import Navbar from "$lib/components/Navbar.svelte";
  import { createTimeLog, getCommitmentWithLogs } from "$lib/log.remote";

  // Fetch commitment data (reactive to param changes)
  let commitmentData = $derived(
    await getCommitmentWithLogs(page.params.commitmentId!),
  );

  // Format minutes to hours:minutes display
  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
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

  // Get today's date in YYYY-MM-DD format for the date input default
  function getTodayString(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }
</script>

<div class="min-h-screen bg-base-200">
  <Navbar user={data.user} />

  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if commitmentData}
      <div in:fade={{ duration: 300 }}>
        <!-- Back link to commitment selector -->
        <a href="/" class="btn btn-ghost btn-sm gap-2 mb-6">
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

        <!-- Commitment header -->
        <div class="mb-8">
          <h1 class="text-3xl font-display font-bold">
            {commitmentData.commitment.title}
          </h1>
          <p class="mt-2 text-neutral">
            {#if commitmentData.commitment.category}
              {commitmentData.commitment.category} &bull;
            {/if}
            <span class="text-primary font-medium">
              {formatDuration(commitmentData.totalMinutes)} / {commitmentData
                .commitment.goalHours}h
            </span>
          </p>
          <progress
            class="progress progress-primary w-full mt-3"
            value={Math.min(
              100,
              (commitmentData.totalMinutes /
                60 /
                commitmentData.commitment.goalHours) *
                100,
            )}
            max="100"
          ></progress>
        </div>

        <!-- Log form -->
        <div
          class="card bg-base-100 mb-8"
          in:fly={{ y: 20, duration: 400, easing: cubicOut }}
        >
          <div class="card-body">
            <h2 class="text-xl font-display font-semibold mb-4">
              Log Your Time
            </h2>

            <form {...createTimeLog} class="space-y-4">
              <!-- Hidden commitment ID -->
              <input
                type="hidden"
                {...createTimeLog.fields.commitmentId.as("text")}
                value={commitmentData.commitment.id}
              />

              <!-- Duration: Hours and Minutes -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Duration</legend>
                <div class="flex items-center gap-2">
                  <input
                    {...createTimeLog.fields.hours.as("number")}
                    min="0"
                    max="23"
                    class="input w-20 text-center"
                    class:input-error={(createTimeLog.fields.hours.issues()
                      ?.length ?? 0) > 0}
                    placeholder="0"
                  />
                  <span class="text-lg font-medium">h</span>
                  <span class="text-xl text-neutral">:</span>
                  <input
                    {...createTimeLog.fields.minutes.as("number")}
                    min="0"
                    max="59"
                    class="input w-20 text-center"
                    class:input-error={(createTimeLog.fields.minutes.issues()
                      ?.length ?? 0) > 0}
                    placeholder="0"
                  />
                  <span class="text-lg font-medium">m</span>
                </div>
                {#each createTimeLog.fields.hours.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
                {#each createTimeLog.fields.minutes.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Date -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Date</legend>
                <input
                  type="date"
                  {...createTimeLog.fields.date.as("text")}
                  value={getTodayString()}
                  class="input w-full max-w-xs"
                  class:input-error={(createTimeLog.fields.date.issues()
                    ?.length ?? 0) > 0}
                />
                {#each createTimeLog.fields.date.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Reflection -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Reflection</legend>
                <textarea
                  {...createTimeLog.fields.reflection.as("text")}
                  class="textarea w-full"
                  class:textarea-error={(createTimeLog.fields.reflection.issues()
                    ?.length ?? 0) > 0}
                  rows="3"
                ></textarea>
                {#each createTimeLog.fields.reflection.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Submit -->
              <button
                type="submit"
                disabled={!!createTimeLog.pending}
                class="btn btn-primary"
              >
                {#if createTimeLog.pending}
                  <span class="loading loading-spinner loading-sm"></span>
                  Logging...
                {:else}
                  Log Time
                {/if}
              </button>

              <!-- Form-level errors -->
              {#each createTimeLog.fields.allIssues() as issue}
                <div class="alert alert-error mt-4">
                  <span>{issue.message}</span>
                </div>
              {/each}
            </form>
          </div>
        </div>

        <!-- Logs list -->
        <div>
          <h2 class="text-xl font-display font-semibold mb-4">
            Your Logs
            {#if commitmentData.logs.length > 0}
              <span class="text-neutral font-normal text-base"
                >({commitmentData.logs.length} entries)</span
              >
            {/if}
          </h2>

          {#if commitmentData.logs.length === 0}
            <div class="text-center py-12">
              <p class="text-neutral">
                No logs yet. Start tracking your progress!
              </p>
            </div>
          {:else}
            <div class="space-y-4">
              {#each commitmentData.logs as log, i (log.id)}
                <div
                  class="card bg-base-100"
                  in:fly={{
                    y: 20,
                    duration: 400,
                    delay: i * 80,
                    easing: cubicOut,
                  }}
                >
                  <div class="card-body py-4">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-medium">
                          {formatDate(log.date)}
                          <span class="text-primary"
                            >&bull; {formatDuration(log.durationMinutes)}</span
                          >
                        </p>
                      </div>
                    </div>
                    <p class="text-neutral mt-2">{log.reflection}</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>
