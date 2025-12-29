<script lang="ts">
  import { logout } from "$lib/auth.remote";

  let { data } = $props();

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const details = document.querySelector("details[open]");
    if (details && !details.contains(event.target as Node)) {
      details.removeAttribute("open");
    }
  }
</script>

<svelte:document onclick={handleClickOutside} />

<div class="min-h-screen bg-slate-50">
  <nav class="bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Brand -->
        <a href="/" class="text-xl font-bold text-indigo-600">100 Hours</a>

        <!-- Nav Links + Auth -->
        <div class="flex items-center space-x-4">
          <a
            href="/log"
            class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Log Hours
          </a>
          <a
            href="/history"
            class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            History
          </a>

          {#if data?.user}
            <details class="relative">
              <summary
                class="cursor-pointer list-none flex items-center text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {data.user.username} &#9662;
              </summary>
              <div
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10"
              >
                <a
                  href="/settings"
                  class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Settings
                </a>
                <form {...logout}>
                  <button
                    class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </details>
          {:else}
            <a
              href="/auth"
              class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 text-sm"
            >
              Sign In
            </a>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <main>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if data.user}
        <h1 class="text-3xl font-bold text-slate-900">
          Welcome back, {data.user.username}!
        </h1>
        <p class="mt-2 text-slate-600">Ready to log some hours?</p>
      {:else}
        <div class="text-center py-16">
          <h1 class="text-4xl font-bold text-slate-900">
            Track Your 100 Hours
          </h1>
          <p class="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Build expertise through deliberate practice. Track your progress
            toward mastery with our simple hour logging system.
          </p>
          <a
            href="/auth"
            class="mt-8 inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Get Started
          </a>
        </div>
      {/if}
    </div>
  </main>
</div>
