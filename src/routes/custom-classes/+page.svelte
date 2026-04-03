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
			low: 'bg-swiss-gray dark:bg-white/20',
			medium: 'bg-swiss-dark-gray dark:bg-white/40',
			high: 'bg-swiss-red'
		}[priority];
	};
</script>

<svelte:head>
	<title>Custom CSS Classes - SvelteDnD Examples</title>
	<meta
		name="description"
		content="Customize drag and drop styling with custom CSS classes. Override default dragging and drag-over styles."
	/>
	<meta property="og:title" content="Custom CSS Classes - SvelteDnD" />
	<meta property="og:description" content="Custom styling for drag and drop with SvelteDnD" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://sveltednd.thisux.com/custom-classes" />
	<meta name="twitter:title" content="Custom CSS Classes - SvelteDnD" />
	<meta name="twitter:description" content="Custom styling for drag and drop with SvelteDnD" />
</svelte:head>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">custom classes</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			add custom classes to draggable and droppable elements
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="max-w-xl">
			<div class="space-y-0 border border-swiss-black dark:border-white/20">
				{#each items as item, index (item.id)}
					<div
						use:draggable={{ container: index.toString(), dragData: item }}
						use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop },
							attributes: {
								draggingClass:
									'!outline-1 !outline-swiss-black !bg-swiss-gray dark:!outline-white/50 dark:!bg-white/10',
								dragOverClass:
									'!outline-1 !outline-dashed !outline-swiss-mid-gray dark:!outline-white/30'
							}
						}}
						animate:flip={{ duration: 400, easing: cubicOut }}
						in:fade={{ duration: 300 }}
						out:fade={{ duration: 200 }}
						class="group cursor-move border-b border-swiss-black bg-white p-8 transition-all last:border-b-0 hover:bg-swiss-gray dark:border-white/20 dark:bg-swiss-black dark:hover:bg-white/10"
					>
						<div class="flex items-start justify-between">
							<div class="flex items-start gap-6">
								<span class="text-xs text-swiss-mid-gray dark:text-white/60"
									>{(index + 1).toString().padStart(2, '0')}</span
								>
								<div>
									<h3 class="text-xl text-swiss-black dark:text-white">{item.title}</h3>
									<p class="mt-2 text-sm text-swiss-mid-gray dark:text-white/60">
										{item.description}
									</p>
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
