<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';

	interface Card {
		id: string;
		color: string;
		icon: string;
	}

	let cards = $state<Card[]>([
		{ id: '1', color: 'bg-swiss-black', icon: '■' },
		{ id: '2', color: 'bg-swiss-dark-gray', icon: '●' },
		{ id: '3', color: 'bg-swiss-red', icon: '▲' },
		{ id: '4', color: 'bg-swiss-mid-gray', icon: '□' },
		{ id: '5', color: 'bg-swiss-black', icon: '○' },
		{ id: '6', color: 'bg-swiss-red', icon: '△' }
	]);

	function handleDrop(state: DragDropState<Card>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		if (!targetContainer || sourceContainer === targetContainer) return;

		cards = cards.filter((card: Card) => card.id !== draggedItem.id);
		cards.splice(parseInt(targetContainer), 0, draggedItem);
	}
</script>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">grid sort</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			drag and drop geometric elements to reorder them in the grid
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="max-w-3xl">
			<div class="grid grid-cols-3 gap-4">
				{#each cards as card, index (card.id)}
					<div
						use:droppable={{
							container: index.toString(),
							direction: 'grid',
							callbacks: { onDrop: handleDrop }
						}}
						class="relative aspect-square border border-swiss-gray p-2 transition-all hover:border-swiss-black dark:border-white/20 dark:hover:border-white/50"
						animate:flip={{ duration: 300 }}
					>
						<div
							use:draggable={{
								container: index.toString(),
								dragData: card
							}}
							class={`svelte-dnd-touch-feedback h-full w-full cursor-move ${card.color} flex items-center justify-center text-4xl text-white transition-transform duration-200 hover:scale-95 active:scale-90`}
						>
							{card.icon}
						</div>
						<div class="absolute -bottom-6 left-1/2 -translate-x-1/2">
							<span class="text-xs text-swiss-mid-gray dark:text-white/60"
								>{(index + 1).toString().padStart(2, '0')}</span
							>
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
