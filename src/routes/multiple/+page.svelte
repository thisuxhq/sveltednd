<script lang="ts">
	import { droppable, draggable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	interface Profile {
		id: string;
		email: string;
		name: string;
		role: string;
		location: string;
	}

	function getAvatarUrl(email: string, size: number = 100) {
		const hash = email.trim().toLowerCase();
		return `https://avatar.vercel.sh/${hash}?size=${size}`;
	}

	let profiles = $state<Profile[]>([
		{
			id: '1',
			email: 'user1@example.com',
			name: 'alex chen',
			role: 'frontend developer',
			location: 'san francisco'
		},
		{
			id: '2',
			email: 'user2@example.com',
			name: 'sarah kim',
			role: 'ux designer',
			location: 'new york'
		},
		{
			id: '3',
			email: 'user3@example.com',
			name: 'mike ross',
			role: 'backend engineer',
			location: 'london'
		},
		{
			id: '4',
			email: 'user4@example.com',
			name: 'emma wilson',
			role: 'product manager',
			location: 'berlin'
		},
		{
			id: '5',
			email: 'user5@example.com',
			name: 'james lee',
			role: 'devops engineer',
			location: 'tokyo'
		},
		{
			id: '6',
			email: 'user6@example.com',
			name: 'luna park',
			role: 'data scientist',
			location: 'seoul'
		}
	]);

	let selectedProfiles = $state<Profile[]>([]);

	function handleDrop(state: DragDropState<Profile>) {
		const { sourceContainer, draggedItem } = state;
		if (sourceContainer === 'available') {
			profiles = profiles.filter((p) => p.id !== draggedItem.id);
			selectedProfiles = [...selectedProfiles, draggedItem];
		} else if (sourceContainer === 'selected') {
			selectedProfiles = selectedProfiles.filter((p) => p.id !== draggedItem.id);
			profiles = [...profiles, draggedItem];
		}
	}
</script>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black md:text-4xl">multiple containers</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray">
			drag team members between columns to manage your team
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Available Profiles Column -->
			<div>
				<div class="mb-6 flex items-baseline justify-between border-b border-swiss-black pb-4">
					<h2 class="text-lg text-swiss-black">available members</h2>
					<span class="text-xs text-swiss-mid-gray"
						>{profiles.length.toString().padStart(2, '0')}</span
					>
				</div>

				<div
					class="border border-swiss-gray p-6"
					use:droppable={{ container: 'available', callbacks: { onDrop: handleDrop } }}
				>
					<div class="grid grid-cols-3 gap-4">
						{#each profiles as profile (profile.id)}
							<div
								use:draggable={{ container: 'available', dragData: profile }}
								animate:flip={{ duration: 200 }}
								in:fade={{ duration: 150 }}
								out:fade={{ duration: 150 }}
								class="group cursor-move border border-swiss-gray bg-white p-4 transition-all hover:border-swiss-black"
							>
								<img
									src={getAvatarUrl(profile.email, 100)}
									alt={profile.name}
									class="mb-3 aspect-square w-full"
								/>
								<div class="text-center">
									<h3 class="text-sm text-swiss-black">{profile.name}</h3>
									<p class="text-xs text-swiss-mid-gray">{profile.role}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Selected Profiles Column -->
			<div>
				<div class="mb-6 flex items-baseline justify-between border-b border-swiss-black pb-4">
					<h2 class="text-lg text-swiss-black">selected members</h2>
					<span class="text-xs text-swiss-mid-gray"
						>{selectedProfiles.length.toString().padStart(2, '0')}</span
					>
				</div>

				<div
					class="border border-swiss-gray p-6"
					use:droppable={{ container: 'selected', callbacks: { onDrop: handleDrop } }}
				>
					<div class="space-y-4">
						{#each selectedProfiles as profile (profile.id)}
							<div
								use:draggable={{ container: 'selected', dragData: profile }}
								animate:flip={{ duration: 200 }}
								in:fade={{ duration: 150 }}
								out:fade={{ duration: 150 }}
								class="group flex cursor-move items-center gap-4 border border-swiss-gray bg-white p-4 transition-all hover:border-swiss-black"
							>
								<img src={getAvatarUrl(profile.email, 64)} alt={profile.name} class="h-16 w-16" />
								<div class="flex-1">
									<h3 class="text-sm text-swiss-black">{profile.name}</h3>
									<p class="text-xs text-swiss-mid-gray">{profile.role}</p>
									<p class="text-xs text-swiss-mid-gray">{profile.location}</p>
								</div>
							</div>
						{/each}

						{#if selectedProfiles.length === 0}
							<div class="flex h-32 items-center justify-center">
								<p class="text-xs text-swiss-mid-gray">drop team members here</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.dragging) {
		opacity: 0.5;
		outline: 1px solid #0a0a0a;
	}

	:global(.drag-over) {
		background-color: #f5f5f5;
		outline: 1px dashed #a3a3a3;
	}
</style>
