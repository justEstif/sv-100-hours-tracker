<script lang="ts">
	import { login, register } from '$lib/auth.remote';

	let isRegister = $state(false);

	// Use the appropriate form based on mode
	const activeForm = $derived(isRegister ? register : login);
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
	<div class="max-w-md w-full">
		<div class="text-center mb-8">
			<span class="text-xl font-bold text-indigo-600">100 Hours</span>
		</div>

		<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
			<h1 class="text-2xl font-bold text-slate-900 text-center mb-6">
				{isRegister ? 'Create Account' : 'Sign In'}
			</h1>

			<form {...activeForm} class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-slate-700">Username</label>
					{#each activeForm.fields.username.issues() as issue}
						<p class="text-sm text-rose-600">{issue.message}</p>
					{/each}
					<input
						{...activeForm.fields.username.as('text')}
						id="username"
						autocomplete="username"
						class="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-slate-700">Password</label>
					{#each activeForm.fields.password.issues() as issue}
						<p class="text-sm text-rose-600">{issue.message}</p>
					{/each}
					<input
						{...activeForm.fields.password.as('password')}
						id="password"
						autocomplete={isRegister ? 'new-password' : 'current-password'}
						class="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
					/>
				</div>

				<div class="flex items-center">
					<input
						type="checkbox"
						id="register"
						bind:checked={isRegister}
						class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
					/>
					<label for="register" class="ml-2 block text-sm text-slate-700">
						I want to create an account
					</label>
				</div>

				<button
					type="submit"
					disabled={!!activeForm.pending}
					class="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
				>
					{#if activeForm.pending}
						Processing...
					{:else}
						{isRegister ? 'Create Account' : 'Sign In'}
					{/if}
				</button>
			</form>

			{#each activeForm.fields.allIssues() as issue}
				<p class="mt-4 text-sm text-rose-600 text-center">{issue.message}</p>
			{/each}
		</div>
	</div>
</div>
