<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

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
		const { draggedItem, targetContainer } = state;
		const dragIndex = items.findIndex((item: Item) => item.id === draggedItem.id);
		const dropIndex = parseInt(targetContainer ?? '0');

		if (dragIndex !== -1 && !isNaN(dropIndex)) {
			const [item] = items.splice(dragIndex, 1);
			items.splice(dropIndex, 0, item);
		}
	}

	const getPriorityMarker = (priority: Item['priority']) => {
		return {
			low: 'bg-swiss-gray',
			medium: 'bg-swiss-dark-gray',
			high: 'bg-swiss-red'
		}[priority];
	};
</script>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black md:text-4xl">custom classes</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray">
			add custom classes to draggable and droppable elements
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="max-w-xl">
			<div class="space-y-0 border border-swiss-black">
				{#each items as item, index (item.id)}
					<div
						use:draggable={{ container: index.toString(), dragData: item }}
						use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop },
							attributes: {
								draggingClass: '!outline-1 !outline-swiss-black !bg-swiss-gray',
								dragOverClass: '!outline-1 !outline-dashed !outline-swiss-mid-gray'
							}
						}}
						animate:flip={{ duration: 400, easing: cubicOut }}
						in:fade={{ duration: 300 }}
						out:fade={{ duration: 200 }}
						class="group cursor-move border-b border-swiss-black bg-white p-8 transition-all last:border-b-0 hover:bg-swiss-gray"
					>
						<div class="flex items-start justify-between">
							<div class="flex items-start gap-6">
								<span class="text-xs text-swiss-mid-gray"
									>{(index + 1).toString().padStart(2, '0')}</span
								>
								<div>
									<h3 class="text-xl text-swiss-black">{item.title}</h3>
									<p class="mt-2 text-sm text-swiss-mid-gray">{item.description}</p>
								</div>
							</div>
							<div class="h-3 w-3 {getPriorityMarker(item.priority)}"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	:global(.dragging) {
		opacity: 0.6;
	}
</style>
