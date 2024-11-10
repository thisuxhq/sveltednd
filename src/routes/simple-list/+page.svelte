<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	interface Item {
		id: string;
		title: string;
		description: string;
		priority: 'low' | 'medium' | 'high';
	}

	const items = $state<Item[]>([
		{
			id: '1',
			title: 'Design System Updates',
			description: 'Update color palette and component library',
			priority: 'high'
		},
		{
			id: '2',
			title: 'User Research',
			description: 'Conduct interviews with 5 key customers',
			priority: 'medium'
		},
		{
			id: '3',
			title: 'API Documentation',
			description: 'Document new endpoints and examples',
			priority: 'low'
		}
	]);

	function handleDrop(state: DragDropState<Item>) {
		const { draggedItem, targetContainer } = state;
		const dragIndex = items.findIndex((item: Item) => item.id === draggedItem.id);
		const dropIndex = parseInt(targetContainer ?? '0');

		if (dragIndex !== -1 && !isNaN(dropIndex)) {
			const [item] = items.splice(dragIndex, 1);
			items.splice(dropIndex, 0, item);
		}
	}

	const getPriorityColor = (priority: Item['priority']) => {
		return {
			low: 'bg-blue-50 text-blue-700',
			medium: 'bg-yellow-50 text-yellow-700',
			high: 'bg-red-50 text-red-700'
		}[priority];
	};
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mb-8 flex flex-col gap-2">
		<h1 class="text-2xl font-bold text-gray-900">Sortable List</h1>
		<p class="text-gray-600">Drag and drop items to reorder them in the list.</p>
	</div>

	<div class="w-80">
		<div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
			<div class="space-y-3">
				{#each items as item, index (item.id)}
					<div
						use:draggable={{ container: index.toString(), dragData: item }}
						use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop }
						}}
						animate:flip={{ duration: 200 }}
						in:fade={{ duration: 150 }}
						out:fade={{ duration: 150 }}
						class="cursor-move rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200
                               transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-200 svelte-dnd-touch-feedback"
					>
						<div class="mb-2 flex items-start justify-between gap-2">
							<h3 class="font-medium text-gray-900">
								{item.title}
							</h3>
							<span
								class={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
									item.priority
								)}`}
							>
								{item.priority}
							</span>
						</div>
						<p class="text-sm text-gray-500">
							{item.description}
						</p>
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

	:global(.drag-over) {
		@apply bg-blue-50;
	}
</style>
