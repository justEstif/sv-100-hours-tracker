<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { page } from "$app/state";
  import Navbar from "$lib/components/Navbar.svelte";
  import { getTimeLog, updateTimeLog } from "$lib/log.remote";

  let { data } = $props();

  // Fetch time log data
  let logData = $derived(
    page.params.logId ? await getTimeLog(page.params.logId) : null,
  );

  // Extract hours and minutes from durationMinutes
  let initialHours = $derived(
    logData ? Math.floor(logData.durationMinutes / 60) : 0,
  );
  let initialMinutes = $derived(logData ? logData.durationMinutes % 60 : 0);

  // Format date for input (YYYY-MM-DD)
  function formatDateForInput(date: Date): string {
    return date.toISOString().split("T")[0];
  }
</script>

<div class="min-h-screen bg-base-200">
  <Navbar user={data.user} />

  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if logData}
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
          Back to {logData.commitment.title}
        </a>

        <!-- Page title -->
        <h1 class="text-3xl font-display font-bold mb-8">Edit Time Log</h1>

        <!-- Edit form -->
        <div
          class="card bg-base-100"
          in:fly={{ y: 20, duration: 400, easing: cubicOut }}
        >
          <div class="card-body">
            <form {...updateTimeLog} class="space-y-4">
              <!-- Hidden ID -->
              <input type="hidden" name="id" value={logData.id} />

              <!-- Duration: Hours and Minutes -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Duration</legend>
                <div class="flex items-center gap-2">
                  <input
                    {...updateTimeLog.fields.hours.as("number")}
                    value={initialHours}
                    min="0"
                    max="23"
                    class="input w-20 text-center"
                    class:input-error={(updateTimeLog.fields.hours.issues()
                      ?.length ?? 0) > 0}
                    placeholder="0"
                  />
                  <span class="text-lg font-medium">h</span>
                  <span class="text-xl text-neutral">:</span>
                  <input
                    {...updateTimeLog.fields.minutes.as("number")}
                    value={initialMinutes}
                    min="0"
                    max="59"
                    class="input w-20 text-center"
                    class:input-error={(updateTimeLog.fields.minutes.issues()
                      ?.length ?? 0) > 0}
                    placeholder="0"
                  />
                  <span class="text-lg font-medium">m</span>
                </div>
                {#each updateTimeLog.fields.hours.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
                {#each updateTimeLog.fields.minutes.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Date -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Date</legend>
                <input
                  type="date"
                  {...updateTimeLog.fields.date.as("text")}
                  value={formatDateForInput(logData.date)}
                  class="input w-full max-w-xs"
                  class:input-error={(updateTimeLog.fields.date.issues()
                    ?.length ?? 0) > 0}
                />
                {#each updateTimeLog.fields.date.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Reflection -->
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Reflection</legend>
                <textarea
                  {...updateTimeLog.fields.reflection.as("text")}
                  class="textarea w-full"
                  class:textarea-error={(updateTimeLog.fields.reflection.issues()
                    ?.length ?? 0) > 0}
                  rows="3"
                >{logData.reflection}</textarea>
                {#each updateTimeLog.fields.reflection.issues() ?? [] as issue}
                  <p class="fieldset-label text-error">{issue.message}</p>
                {/each}
              </fieldset>

              <!-- Buttons -->
              <div class="flex gap-2">
                <button
                  type="submit"
                  disabled={!!updateTimeLog.pending}
                  class="btn btn-primary"
                >
                  {#if updateTimeLog.pending}
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
              {#each updateTimeLog.fields.allIssues() as issue}
                <div class="alert alert-error mt-4">
                  <span>{issue.message}</span>
                </div>
              {/each}
            </form>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center py-16">
        <h2 class="text-xl font-display font-semibold mb-2">Log Not Found</h2>
        <p class="text-neutral mb-6">
          This time log doesn't exist or you don't have permission to edit it.
        </p>
        <a href="/{page.params.commitmentId}" class="btn btn-primary">
          Go Back
        </a>
      </div>
    {/if}
  </main>
</div>
