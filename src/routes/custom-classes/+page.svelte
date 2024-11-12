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

	const dragStyles = {
		low: 'bg-gradient-to-r from-sky-400/30 via-blue-400/20 to-indigo-400/30 backdrop-blur-lg',
		medium:
			'bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-yellow-400/30 backdrop-blur-lg',
		high: 'bg-gradient-to-r from-rose-400/30 via-red-400/20 to-pink-400/30 backdrop-blur-lg'
	};
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-8">
	<div class="mb-8 flex flex-col gap-2">
		<h1 class="text-2xl font-bold text-gray-900">Custom classes</h1>
		<p class="text-gray-600">You can add custom classes to the draggable and droppable elements.</p>
	</div>

	<div class="w-80">
		<div class="rounded-xl bg-white/40 p-4 shadow-lg ring-1 ring-white/60 backdrop-blur-xl">
			<div class="space-y-4">
				{#each items as item, index (item.id)}
					<div
						use:draggable={{ container: index.toString(), dragData: item }}
						use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop },
							attributes: {
								draggingClass: 'scale-105 rotate-2 !shadow-2xl !ring-2 ring-blue-500/50 z-50',
								dragOverClass: 'scale-98 -rotate-1 !shadow-inner !ring-2 ring-emerald-500/50'
							}
						}}
						animate:flip={{ duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
						in:fade={{ duration: 300 }}
						out:fade={{ duration: 200 }}
						class="group relative cursor-move rounded-lg p-4
                               shadow-md ring-1 ring-white/60
                               backdrop-blur-md transition-all duration-500
                               ease-out hover:-rotate-1 hover:scale-[1.02]
                               hover:shadow-xl active:shadow-inner
                               {dragStyles[item.priority]}"
					>
						<div class="relative overflow-hidden rounded-md">
							<!-- Enhanced gradient overlay -->
							<div
								class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/20 opacity-0
                                      transition-all duration-500 group-hover:opacity-100"
							/>

							<!-- Kanban card content -->
							<div class="relative z-10 space-y-2">
								<div class="flex items-start justify-between">
									<h3 class="font-medium text-gray-900">{item.title}</h3>
									<span
										class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
													 {getPriorityColor(item.priority)}"
									>
										{item.priority}
									</span>
								</div>
								<p class="text-sm text-gray-600">{item.description}</p>
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
		@apply opacity-60;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 0.8;
		}
	}

	:global(.drag-over) {
		@apply bg-blue-50;
	}

	/* Add custom scaling utility */
	.scale-102 {
		transform: scale(1.02);
	}
	.scale-98 {
		transform: scale(0.98);
	}
</style>
