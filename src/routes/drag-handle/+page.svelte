<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	interface Item {
		id: string;
		title: string;
		description: string;
	}

	const items = $state<Item[]>([
		{ id: '1', title: 'Review pull requests', description: 'Check open PRs on GitHub' },
		{ id: '2', title: 'Update documentation', description: 'Add new API examples' },
		{ id: '3', title: 'Fix login bug', description: 'Users unable to reset password' },
		{ id: '4', title: 'Deploy to staging', description: 'Push latest changes for QA' }
	]);

	function handleDrop(state: DragDropState<Item>) {
		const { draggedItem, targetContainer, dropPosition } = state;
		const dragIndex = items.findIndex((item: Item) => item.id === draggedItem.id);
		let dropIndex = parseInt(targetContainer ?? '0');
		if (dropPosition === 'after') dropIndex += 1;

		if (dragIndex !== -1 && !isNaN(dropIndex)) {
			const [item] = items.splice(dragIndex, 1);
			const adjusted = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
			items.splice(adjusted, 0, item);
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mb-8 flex flex-col gap-2">
		<h1 class="text-2xl font-bold text-gray-900">Drag Handle</h1>
		<p class="text-gray-600">
			Only the grip icon starts a drag. Text and other content remain selectable.
		</p>
	</div>

	<div class="w-96">
		<div class="rounded-xl bg-gray-100 p-4 shadow-sm ring-1 ring-gray-200">
			<div class="space-y-3">
				{#each items as item, index (item.id)}
					<div
						use:draggable={{
							container: index.toString(),
							dragData: item,
							handle: '.drag-handle'
						}}
						use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop }
						}}
						animate:flip={{ duration: 200 }}
						in:fade={{ duration: 150 }}
						out:fade={{ duration: 150 }}
						class="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200
                               transition-all duration-200 hover:shadow-md"
					>
						<button
							aria-label="Drag to reorder"
							class="drag-handle mt-0.5 cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<circle cx="9" cy="5" r="1.5" />
								<circle cx="15" cy="5" r="1.5" />
								<circle cx="9" cy="12" r="1.5" />
								<circle cx="15" cy="12" r="1.5" />
								<circle cx="9" cy="19" r="1.5" />
								<circle cx="15" cy="19" r="1.5" />
							</svg>
						</button>
						<div class="flex-1">
							<h3 class="font-medium text-gray-900">{item.title}</h3>
							<p class="text-sm text-gray-500">{item.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	:global(.dragging) {
		@apply opacity-50 shadow-lg ring-2 ring-blue-400;
	}
</style>
