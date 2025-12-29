<script lang="ts">
  import { login, register } from "$lib/auth.remote";

  let isRegister = $state(false);

  const activeForm = $derived(isRegister ? register : login);
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <!-- Brand -->
    <div class="text-center mb-8">
      <a href="/" class="text-2xl font-display font-bold text-primary"
        >100 Hours</a
      >
    </div>

    <!-- Auth Card -->
    <div class="card bg-base-100">
      <div class="card-body">
        <h1 class="text-2xl font-display font-bold text-center mb-6">
          {isRegister ? "Create Account" : "Sign In"}
        </h1>

        <form {...activeForm} class="space-y-4">
          <!-- Username -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Username</legend>
            <input
              {...activeForm.fields.username.as("text")}
              id="username"
              autocomplete="username"
              class="input w-full"
              class:input-error={(activeForm.fields.username.issues()?.length ??
                0) > 0}
            />
            {#each activeForm.fields.username.issues() ?? [] as issue}
              <p class="fieldset-label text-error">{issue.message}</p>
            {/each}
          </fieldset>

          <!-- Password -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Password</legend>
            <input
              {...activeForm.fields.password.as("password")}
              id="password"
              autocomplete={isRegister ? "new-password" : "current-password"}
              class="input w-full"
              class:input-error={(activeForm.fields.password.issues()?.length ??
                0) > 0}
            />
            {#each activeForm.fields.password.issues() ?? [] as issue}
              <p class="fieldset-label text-error">{issue.message}</p>
            {/each}
          </fieldset>

          <!-- Register toggle -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={isRegister}
              class="checkbox checkbox-primary"
            />
            <span class="text-sm">I want to create an account</span>
          </label>

          <!-- Submit -->
          <button
            type="submit"
            disabled={!!activeForm.pending}
            class="btn btn-primary w-full"
          >
            {#if activeForm.pending}
              <span class="loading loading-spinner loading-sm"></span>
              Processing...
            {:else}
              {isRegister ? "Create Account" : "Sign In"}
            {/if}
          </button>
        </form>

        <!-- Form-level errors -->
        {#each activeForm.fields.allIssues() as issue}
          <div class="alert alert-error mt-4">
            <span>{issue.message}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
