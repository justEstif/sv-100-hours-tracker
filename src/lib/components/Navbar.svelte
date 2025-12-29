<script lang="ts">
  import { logout } from "$lib/auth.remote";

  interface Props {
    user: { username: string } | null;
  }

  let { user }: Props = $props();
</script>

<svelte:document
  onclick={(event) => {
    const details = document.querySelector("details[open]");
    if (details && !details.contains(event.target as Node)) {
      details.removeAttribute("open");
    }
  }}
/>

<nav class="max-w-4xl mx-auto navbar bg-base-100 shadow-soft sticky top-0 z-50">
  <div class="navbar-start">
    <a href="/" class="text-xl font-display font-bold text-primary">100 Hours</a
    >
  </div>

  <div class="navbar-end">
    <ul class="menu menu-horizontal px-1 gap-1">
      <li><a href="/history">History</a></li>
    </ul>

    {#if user}
      <details class="dropdown dropdown-end ml-2">
        <summary class="btn btn-ghost m-1">
          {user.username}
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <ul
          class="dropdown-content menu bg-base-100 rounded-box z-10 w-48 p-2 shadow-soft-lg"
        >
          <li><a href="/settings">Settings</a></li>
          <li>
            <form {...logout} class="p-0">
              <button type="submit" class="w-full text-left px-4 py-2"
                >Logout</button
              >
            </form>
          </li>
        </ul>
      </details>
    {:else}
      <a href="/auth" class="btn btn-primary ml-2">Sign In</a>
    {/if}
  </div>
</nav>
