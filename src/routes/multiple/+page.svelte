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
			name: 'Alex Chen',
			role: 'Frontend Developer',
			location: 'San Francisco'
		},
		{
			id: '2',
			email: 'user2@example.com',
			name: 'Sarah Kim',
			role: 'UX Designer',
			location: 'New York'
		},
		{
			id: '3',
			email: 'user3@example.com',
			name: 'Mike Ross',
			role: 'Backend Engineer',
			location: 'London'
		},
		{
			id: '4',
			email: 'user4@example.com',
			name: 'Emma Wilson',
			role: 'Product Manager',
			location: 'Berlin'
		},
		{
			id: '5',
			email: 'user5@example.com',
			name: 'James Lee',
			role: 'DevOps Engineer',
			location: 'Tokyo'
		},
		{
			id: '6',
			email: 'user6@example.com',
			name: 'Luna Park',
			role: 'Data Scientist',
			location: 'Seoul'
		}
	]);

	let selectedProfiles = $state<Profile[]>([]);

	function handleDrop(state: DragDropState<Profile>) {
		const { sourceContainer, draggedItem } = state;
		if (sourceContainer === 'avatars') {
			profiles = profiles.filter((p) => p.id !== draggedItem.id);
			selectedProfiles = [...selectedProfiles, draggedItem];
		} else if (sourceContainer === 'details') {
			selectedProfiles = selectedProfiles.filter((p) => p.id !== draggedItem.id);
			profiles = [...profiles, draggedItem];
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex flex-col gap-2">
			<h1 class="text-2xl font-bold text-gray-900">Team Directory - Multiple Containers</h1>
			<p class="text-gray-600">
				Drag team members between columns to manage your team. (Note: Both are 2 different
				containers. You can add as many containers as you want.)
			</p>
		</div>

		<div class="flex gap-6 overflow-x-auto p-2">
			<!-- Available Profiles Column -->
			<div class="w-full max-w-xl flex-none">
				<div
					class="rounded-xl bg-gray-100 p-4 shadow-sm ring-1 ring-gray-200"
					use:droppable={{ container: 'avatars', callbacks: { onDrop: handleDrop } }}
				>
					<div class="mb-4 flex items-center justify-between">
						<h2 class="font-semibold text-gray-900">Available Members</h2>
						<span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-700">
							{profiles.length}
						</span>
					</div>

					<div class="grid grid-cols-3 gap-3">
						{#each profiles as profile (profile.id)}
							<div
								use:draggable={{ container: 'avatars', dragData: profile }}
								animate:flip={{ duration: 200 }}
								in:fade={{ duration: 150 }}
								out:fade={{ duration: 150 }}
								class="group cursor-move rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200
                                       transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-200"
							>
								<div class="relative mb-2">
									<img
										src={getAvatarUrl(profile.email, 100)}
										alt={profile.name}
										class="aspect-square w-full rounded-full ring-2 ring-white"
									/>
									<div
										class="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2
                                           border-white bg-green-400"
									></div>
								</div>
								<div class="text-center">
									<h3 class="text-sm font-medium text-gray-900">{profile.name}</h3>
									<p class="text-xs text-gray-500">{profile.role}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Selected Profiles Column -->
			<div class="w-96 flex-none">
				<div
					class="rounded-xl bg-gray-100 p-4 shadow-sm ring-1 ring-gray-200"
					use:droppable={{ container: 'details', callbacks: { onDrop: handleDrop } }}
				>
					<div class="mb-4 flex items-center justify-between">
						<h2 class="font-semibold text-gray-900">Selected Members</h2>
						<span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-sm text-purple-700">
							{selectedProfiles.length}
						</span>
					</div>

					<div class="space-y-3">
						{#each selectedProfiles as profile (profile.id)}
							<div
								use:draggable={{ container: 'details', dragData: profile }}
								animate:flip={{ duration: 200 }}
								in:fade={{ duration: 150 }}
								out:fade={{ duration: 150 }}
								class="group cursor-move rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200
                                       transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-purple-200"
							>
								<div class="flex items-center gap-3">
									<img
										src={getAvatarUrl(profile.email, 48)}
										alt={profile.name}
										class="h-12 w-12 rounded-full ring-2 ring-white"
									/>
									<div class="flex-1">
										<h3 class="font-medium text-gray-900">{profile.name}</h3>
										<p class="text-sm text-gray-500">{profile.role}</p>
									</div>
									<div class="text-right">
										<span class="text-xs text-gray-500">{profile.location}</span>
										<span
											class="mt-1 block text-xs text-gray-400 opacity-0 transition-opacity
                                                   group-hover:opacity-100"
										>
											↩️ drag back
										</span>
									</div>
								</div>
							</div>
						{/each}

						{#if selectedProfiles.length === 0}
							<div
								class="flex h-32 items-center justify-center rounded-lg border-2 border-dashed
                                       border-gray-200 text-sm text-gray-400"
							>
								Drop team members here
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
		@apply opacity-50 shadow-lg ring-2 ring-blue-400;
	}

	:global(.drag-over) {
		@apply bg-blue-50 ring-2 ring-blue-400;
	}
</style>
