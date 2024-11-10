<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';

	interface Card {
		id: string;
		color: string;
		icon: string;
	}

	let cards = $state<Card[]>([
		{ id: '1', color: 'from-rose-400 to-red-500', icon: '🎨' },
		{ id: '2', color: 'from-blue-400 to-blue-600', icon: '🌊' },
		{ id: '3', color: 'from-green-400 to-green-600', icon: '🌿' },
		{ id: '4', color: 'from-amber-300 to-yellow-500', icon: '⭐' },
		{ id: '5', color: 'from-purple-400 to-purple-600', icon: '🔮' },
		{ id: '6', color: 'from-pink-400 to-pink-600', icon: '🌸' }
	]);

	function handleDrop(state: DragDropState<Card>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		if (!targetContainer || sourceContainer === targetContainer) return; // Prevent self-placement

		cards = cards.filter((card: Card) => card.id !== draggedItem.id); // Remove the dragged item
		cards.splice(parseInt(targetContainer), 0, draggedItem); // Insert the dragged item at the new position
	}
</script>

<div
	class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 dark:from-slate-900 dark:to-slate-800"
>
	<div class="max-w-2xl">
		<div class="mb-8 flex flex-col gap-2">
			<h1 class="text-2xl font-bold text-gray-900">SortGable Grid</h1>
			<p class="text-gray-600">Drag and drop items to reorder them in the grid.</p>
		</div>

		<div class="grid grid-cols-3 gap-6">
			{#each cards as card, index (card.id)}
				<div
					use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
					class="relative aspect-square rounded-xl bg-white/50 p-1 backdrop-blur-sm
                           transition-all duration-300 hover:bg-white/60 dark:bg-slate-800/50"
					animate:flip={{ duration: 300 }}
				>
					<div
						use:draggable={{
							container: index.toString(),
							dragData: card
						}}
						class={`h-full w-full cursor-move rounded-lg bg-gradient-to-br ${card.color} shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95 active:brightness-110 svelte-dnd-touch-feedback`}
					>
						<div class="flex h-full items-center justify-center">
							<span class="text-4xl">{card.icon}</span>
						</div>
					</div>
					<div
						class="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90
                              px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-700
                              dark:text-slate-300"
					>
						Position {index + 1}
					</div>
				</div>{/each}
		</div>
	</div>
</div>
