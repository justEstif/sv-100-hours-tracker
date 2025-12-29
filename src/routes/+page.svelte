<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Navbar from '$lib/components/Navbar.svelte';
	import { createCommitment, getCommitments } from '$lib/log.remote';

	let { data } = $props();

	// Fetch commitments list
	let commitments = $derived(await getCommitments());

	// Format minutes to hours:minutes display
	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours === 0) return `${mins}m`;
		if (mins === 0) return `${hours}h`;
		return `${hours}h ${mins}m`;
	}
</script>

<div class="min-h-screen bg-base-200">
	<Navbar user={data.user} />

	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if data.user}
			<!-- Signed in: Show commitments list and create form -->
			<div in:fade={{ duration: 300 }}>
				<div class="mb-8">
					<h1 class="text-3xl font-display font-bold">Welcome back, {data.user.username}!</h1>
					<p class="mt-2 text-neutral">Ready to log some hours?</p>
				</div>

				{#if commitments.length > 0}
					<!-- Commitment selector -->
					<section class="mb-8">
						<h2 class="text-xl font-display font-semibold mb-4">Your Commitments</h2>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{#each commitments as commitment, i (commitment.id)}
								{@const progressPercent = Math.min(
									100,
									Math.round((commitment.totalMinutes / 60 / commitment.goalHours) * 100)
								)}
								<a
									href="/{commitment.id}"
									class="card bg-base-100 hover:-translate-y-1 hover:shadow-soft-lg transition-all duration-200"
									in:fly={{ y: 20, duration: 400, delay: i * 80, easing: cubicOut }}
								>
									<div class="card-body">
										<div class="flex justify-between items-start gap-3">
											<div class="flex-1 min-w-0">
												<h3 class="card-title font-display">{commitment.title}</h3>
												{#if commitment.category}
													<p class="text-sm text-neutral">{commitment.category}</p>
												{/if}
											</div>
											<div
												class="radial-progress text-primary text-xs font-medium shrink-0"
												style="--value:{progressPercent}; --size:3.5rem; --thickness:4px;"
												role="progressbar"
												aria-valuenow={progressPercent}
											>
												{formatDuration(commitment.totalMinutes)}
											</div>
										</div>
										<div class="card-actions justify-end mt-2">
											<span class="btn btn-primary btn-sm">Log Time</span>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</section>

					<div class="divider text-neutral">OR</div>
				{/if}

				<!-- Create commitment form -->
				<section>
					<h2 class="text-xl font-display font-semibold mb-4">
						{commitments.length > 0 ? 'Create New Commitment' : 'Create Your First Commitment'}
					</h2>
					<div
						class="card bg-base-100"
						in:fly={{
							y: 20,
							duration: 400,
							delay: commitments.length * 80,
							easing: cubicOut
						}}
					>
						<div class="card-body">
							<form {...createCommitment} class="space-y-4">
								<!-- Title -->
								<fieldset class="fieldset">
									<legend class="fieldset-legend">What do you want to master?</legend>
									<input
										{...createCommitment.fields.title.as('text')}
										class="input w-full"
										class:input-error={(createCommitment.fields.title.issues()?.length ?? 0) > 0}
										placeholder="e.g., Guitar, Spanish, Cooking..."
									/>
									{#each createCommitment.fields.title.issues() ?? [] as issue}
										<p class="fieldset-label text-error">{issue.message}</p>
									{/each}
								</fieldset>

								<!-- Category (optional) -->
								<fieldset class="fieldset">
									<legend class="fieldset-legend">Category (optional)</legend>
									<input
										{...createCommitment.fields.category.as('text')}
										class="input w-full"
										class:input-error={(createCommitment.fields.category.issues()?.length ?? 0) > 0}
										placeholder="e.g., Music, Language, Fitness..."
									/>
									{#each createCommitment.fields.category.issues() ?? [] as issue}
										<p class="fieldset-label text-error">{issue.message}</p>
									{/each}
								</fieldset>

								<!-- Submit -->
								<button type="submit" disabled={!!createCommitment.pending} class="btn btn-primary">
									{#if createCommitment.pending}
										<span class="loading loading-spinner loading-sm"></span>
										Creating...
									{:else}
										Create & Start Logging
									{/if}
								</button>

								<!-- Form-level errors -->
								{#each createCommitment.fields.allIssues() as issue}
									<div class="alert alert-error mt-4">
										<span>{issue.message}</span>
									</div>
								{/each}
							</form>
						</div>
					</div>
				</section>
			</div>
		{:else}
			<!-- Signed out: Show landing page -->
			<div class="text-center py-16">
				<h1 class="text-4xl font-display font-bold mb-4">Track Your 100 Hours</h1>
				<p class="text-lg text-neutral max-w-2xl mx-auto mb-8">
					Build expertise through deliberate practice. Track your progress toward mastery with our
					simple hour logging system.
				</p>
				<a href="/auth" class="btn btn-primary btn-lg">Get Started</a>
			</div>
		{/if}
	</main>
</div>
