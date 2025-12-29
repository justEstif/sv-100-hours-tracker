<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { getAllLogs } from "$lib/log.remote";
  import { cubicOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";

  let { data } = $props();

  // Fetch all logs
  let logsList = $derived(await getAllLogs());

  // TODO Move these to some utils or helper file
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
</script>

<div class="min-h-screen bg-base-200">
  <Navbar user={data.user} />

  <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div in:fade={{ duration: 300 }}>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-display font-bold">Your History</h1>
        {#if logsList.length > 0}
          <p class="mt-2 text-neutral">
            {logsList.length}
            {logsList.length === 1 ? "entry" : "entries"} logged
          </p>
        {/if}
      </div>

      <!-- Logs list -->
      {#if logsList.length === 0}
        <div class="text-center py-16">
          <p class="text-neutral text-lg">
            No logs yet. Start tracking your first commitment!
          </p>
          <a href="/" class="btn btn-primary mt-4">Get Started</a>
        </div>
      {:else}
        <div class="space-y-4">
          {#each logsList as log, i (log.id)}
            <div
              class="card bg-base-100"
              in:fly={{
                y: 20,
                duration: 400,
                delay: Math.min(i * 50, 500),
                easing: cubicOut,
              }}
            >
              <div class="card-body py-4">
                <div class="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <a
                      href="/{log.commitment.id}"
                      class="font-display font-semibold text-lg hover:text-primary transition-colors"
                    >
                      {log.commitment.title}
                    </a>
                    {#if log.commitment.category}
                      <span class="text-neutral text-sm ml-2"
                        >{log.commitment.category}</span
                      >
                    {/if}
                  </div>
                  <div class="text-right text-sm">
                    <p class="font-medium">{formatDate(log.date)}</p>
                    <p class="text-primary font-medium">
                      {formatDuration(log.durationMinutes)}
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
  </main>
</div>
