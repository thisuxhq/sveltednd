<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';

	interface Item {
		id: string;
		title: string;
	}

	let items = $state<Item[]>([
		{ id: '1', title: 'this list is interactive' },
		{ id: '2', title: 'you can drag and drop items' },
		{ id: '3', title: 'you can also select items' },
		{ id: '4', title: 'you can also delete items' }
	]);

	function handleDelete(id: string) {
		items = items.filter((item) => item.id !== id);
	}

	function handleSelect(id: string) {
		console.log('selected item:', id);
		alert('selected item: ' + id);
	}

	function handleDrop(state: DragDropState<Item>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		if (!targetContainer || sourceContainer === targetContainer) return;

		const sourceIndex = items.findIndex((item) => item.id === draggedItem.id);
		const targetIndex = parseInt(targetContainer);

		const [movedItem] = items.splice(sourceIndex, 1);
		items.splice(targetIndex, 0, movedItem);
		items = [...items];
	}
</script>

<svelte:head>
	<title>Interactive Elements - SvelteDnD Examples</title>
	<meta
		name="description"
		content="Combine drag and drop with clickable buttons and interactive elements. Click to select or delete while dragging."
	/>
	<meta property="og:title" content="Interactive Elements - SvelteDnD" />
	<meta property="og:description" content="Drag with interactive elements using SvelteDnD" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://sveltednd.thisux.com/interactive-elements" />
	<meta name="twitter:title" content="Interactive Elements - SvelteDnD" />
	<meta name="twitter:description" content="Drag with interactive elements using SvelteDnD" />
</svelte:head>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">interactive elements</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			click items or buttons while also being able to drag and reorder
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="max-w-2xl">
			<div
				class="divide-y divide-swiss-black border border-swiss-black dark:divide-white/20 dark:border-white/20"
			>
				{#each items as item, index (item.id)}
					<div
						use:droppable={{
							container: index.toString(),
							callbacks: {
								onDrop: handleDrop
							}
						}}
						use:draggable={{
							container: index.toString(),
							dragData: item,
							handle: '[data-drag-handle]',
							interactive: ['[data-delete-btn]', '[data-select-btn]', '.interactive']
						}}
						class="flex items-center justify-between bg-white p-6 transition-colors hover:bg-swiss-gray dark:bg-swiss-black dark:hover:bg-white/10"
					>
						<div class="flex items-center gap-6">
							<span
								data-drag-handle
								class="cursor-grab text-xs text-swiss-mid-gray dark:text-white/60"
								>{(index + 1).toString().padStart(2, '0')}</span
							>
							<button
								data-select-btn
								class="interactive text-swiss-black transition-colors hover:text-swiss-red dark:text-white"
								onclick={() => handleSelect(item.id)}
							>
								{item.title}
							</button>
						</div>

						<button
							data-delete-btn
							class="interactive text-xs text-swiss-mid-gray transition-colors hover:text-swiss-red dark:text-white/60"
							onclick={() => handleDelete(item.id)}
						>
							delete
						</button>
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

	.dark :global(.dragging) {
		opacity: 0.5;
		outline: 1px solid rgba(255, 255, 255, 0.5);
	}
</style>
