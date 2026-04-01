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
			title: 'design system updates',
			description: 'update color palette and component library',
			priority: 'high'
		},
		{
			id: '2',
			title: 'user research',
			description: 'conduct interviews with 5 key customers',
			priority: 'medium'
		},
		{
			id: '3',
			title: 'api documentation',
			description: 'document new endpoints and examples',
			priority: 'low'
		}
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

	const getPriorityMarker = (priority: Item['priority']) => {
		return {
			low: 'bg-swiss-gray dark:bg-white/20',
			medium: 'bg-swiss-dark-gray dark:bg-white/40',
			high: 'bg-swiss-red'
		}[priority];
	};
</script>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">simple list</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			drag and drop items to reorder them in the list
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="max-w-2xl">
			<div class="border border-swiss-black dark:border-white/20">
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
						class="svelte-dnd-touch-feedback group cursor-move border-b border-swiss-black bg-white p-6 transition-all last:border-b-0 hover:bg-swiss-gray dark:border-white/20 dark:bg-swiss-black dark:hover:bg-white/10"
					>
						<div class="flex items-start gap-6">
							<span class="text-xs text-swiss-mid-gray dark:text-white/60"
								>{(index + 1).toString().padStart(2, '0')}</span
							>
							<div class="flex-1">
								<div class="mb-2 flex items-start justify-between">
									<h3 class="text-lg text-swiss-black dark:text-white">{item.title}</h3>
									<div class="h-2 w-2 {getPriorityMarker(item.priority)}"></div>
								</div>
								<p class="text-sm text-swiss-mid-gray dark:text-white/60">{item.description}</p>
							</div>
						</div>
					</div>
				{/each}
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

	.dark :global(.dragging) {
		opacity: 0.5;
		outline: 1px solid rgba(255, 255, 255, 0.5);
	}

	.dark :global(.drag-over) {
		background-color: rgba(255, 255, 255, 0.1);
		outline: 1px dashed rgba(255, 255, 255, 0.3);
	}
</style>
