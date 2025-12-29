<script lang="ts">
  import { page } from "$app/state";
  import Navbar from "$lib/components/Navbar.svelte";
  import { changePassword, deleteAccount } from "$lib/settings.remote";

  let { data } = $props();

  let dismissed = $state(false);
  let showToast = $derived(
    !dismissed && page.url.searchParams.get("success") === "password"
  );

  function dismissToast() {
    dismissed = true;
    // Remove query param from URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    window.history.replaceState({}, "", url);
  }
</script>

<Navbar user={data.user} />

<main class="max-w-2xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-display font-bold mb-8">Settings</h1>

  <div class="card bg-base-100">
    <div class="card-body">
      <!-- Change Password Section -->
      <section>
        <h2 class="text-xl font-display font-semibold mb-4">Change Password</h2>

        <form {...changePassword} class="space-y-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Current Password</legend>
            <input
              {...changePassword.fields.currentPassword.as("password")}
              autocomplete="current-password"
              class="input w-full"
              class:input-error={(changePassword.fields.currentPassword.issues()
                ?.length ?? 0) > 0}
            />
            {#each changePassword.fields.currentPassword.issues() ?? [] as issue}
              <p class="fieldset-label text-error">{issue.message}</p>
            {/each}
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">New Password</legend>
            <input
              {...changePassword.fields.newPassword.as("password")}
              autocomplete="new-password"
              class="input w-full"
              class:input-error={(changePassword.fields.newPassword.issues()
                ?.length ?? 0) > 0}
            />
            {#each changePassword.fields.newPassword.issues() ?? [] as issue}
              <p class="fieldset-label text-error">{issue.message}</p>
            {/each}
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">Confirm New Password</legend>
            <input
              {...changePassword.fields.confirmPassword.as("password")}
              autocomplete="new-password"
              class="input w-full"
              class:input-error={(changePassword.fields.confirmPassword.issues()
                ?.length ?? 0) > 0}
            />
            {#each changePassword.fields.confirmPassword.issues() ?? [] as issue}
              <p class="fieldset-label text-error">{issue.message}</p>
            {/each}
          </fieldset>

          <button
            type="submit"
            disabled={!!changePassword.pending}
            class="btn btn-primary"
          >
            {#if changePassword.pending}
              <span class="loading loading-spinner loading-sm"></span>
              Updating...
            {:else}
              Update Password
            {/if}
          </button>
        </form>
      </section>

      <div class="divider my-8"></div>

      <!-- Delete Account Section -->
      <section>
        <h2 class="text-xl font-display font-semibold mb-2 text-error">
          Delete Account
        </h2>
        <p class="text-sm text-base-content/70 mb-4">
          This action is permanent. All your data including commitments, time
          logs, and milestones will be deleted.
        </p>

        <form {...deleteAccount} class="space-y-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Password</legend>
            <input
              {...deleteAccount.fields.password.as("password")}
              autocomplete="current-password"
              class="input w-full"
              class:input-error={(deleteAccount.fields.password.issues()
                ?.length ?? 0) > 0}
            />
            {#each deleteAccount.fields.password.issues() ?? [] as issue}
              <p class="fieldset-label text-error">{issue.message}</p>
            {/each}
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">Type DELETE to confirm</legend>
            <input
              {...deleteAccount.fields.confirmation.as("text")}
              autocomplete="off"
              class="input w-full"
              class:input-error={(deleteAccount.fields.confirmation.issues()
                ?.length ?? 0) > 0}
            />
            {#each deleteAccount.fields.confirmation.issues() ?? [] as issue}
              <p class="fieldset-label text-error">{issue.message}</p>
            {/each}
          </fieldset>

          <button
            type="submit"
            disabled={!!deleteAccount.pending}
            class="btn btn-error"
          >
            {#if deleteAccount.pending}
              <span class="loading loading-spinner loading-sm"></span>
              Deleting...
            {:else}
              Delete Account
            {/if}
          </button>
        </form>
      </section>
    </div>
  </div>
</main>

<!-- Success Toast -->
{#if showToast}
  <div class="toast toast-top toast-end">
    <div class="alert alert-success">
      <span>Password updated successfully</span>
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        onclick={dismissToast}
        aria-label="Dismiss notification"
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}
