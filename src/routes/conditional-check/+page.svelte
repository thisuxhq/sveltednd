<script lang="ts">
	import { draggable, droppable } from '$lib/index.js';
	import { dndState } from '$lib/stores/dnd.svelte.js';
	import type { DragDropState } from '$lib/types/index.js';

	interface Fruit {
		id: string;
		name: string;
		color: string;
	}

	let sourceFruits = $state([
		{ id: '1', name: 'Apple', color: 'Red' },
		{ id: '2', name: 'Banana', color: 'Yellow' },
		{ id: '3', name: 'Grapes', color: 'Green' },
		{ id: '4', name: 'Orange', color: 'Orange' },
		{ id: '5', name: 'Pineapple', color: 'Yellow' },
		{ id: '6', name: 'Strawberry', color: 'Red' },
		{ id: '7', name: 'Watermelon', color: 'Green' }
	]);

	let targetFruits = $state([]);

	// Add a derived state for empty states
	let isTargetEmpty = $derived(targetFruits.length === 0);
	let isSourceEmpty = $derived(sourceFruits.length === 0);

	// Validation function that sets invalidDrop state
	function validateDrop(state: DragDropState<Fruit>) {
		const fruit = state.draggedItem;
		if (!fruit) return;

		// Set invalidDrop based on the color condition
		dndState.invalidDrop = fruit.color !== 'Red';
	}

	const dragDropCallbacks = {
		onDragOver: (state: DragDropState<Fruit>) => {
			validateDrop(state);
		},
		onDrop: async (state: DragDropState<Fruit>) => {
			if (dndState.invalidDrop || !state.draggedItem) {
				return; // Prevent invalid drops
			}

			// Move fruit to target container
			sourceFruits = sourceFruits.filter((fruit) => fruit.id !== state.draggedItem.id);
			targetFruits = [...targetFruits, state.draggedItem];
		},
		onDragEnd: () => {
			// Reset invalidDrop state when drag ends
			dndState.invalidDrop = false;
		}
	};
</script>

<div class="container mx-auto p-8">
	<div class="mb-12 space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">Fruit Sorter</h1>
		<p class="text-muted-foreground">
			Drop the red fruits in the target zone. Other colors will be rejected.
		</p>
	</div>

	<div class="grid gap-8 md:grid-cols-2">
		<!-- Source Container -->
		<div class="space-y-4">
			<h2 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Available Fruits</h2>
			<div
				class="min-h-[400px] rounded-lg border bg-white p-4 shadow-sm transition-all"
				use:droppable={{ container: 'source' }}
			>
				{#if isSourceEmpty}
					<div class="flex h-full items-center justify-center">
						<p class="text-muted-foreground">All fruits have been sorted</p>
					</div>
				{:else}
					<div class="grid gap-2">
						{#each sourceFruits as fruit}
							<div
								use:draggable={{ container: 'source', dragData: fruit }}
								class={`group flex items-center justify-between rounded-md border p-3 shadow-sm transition-all hover:shadow
									${fruit.color === 'Red' ? 'border-red-200 bg-red-50/50' : 'border-muted bg-muted/5'}`}
							>
								<span class="font-medium">{fruit.name}</span>
								<span
									class={`rounded px-2 py-1 text-xs
									${fruit.color === 'Red' ? 'bg-red-100 text-red-700' : 'bg-muted/10 text-muted-foreground'}`}
								>
									{fruit.color}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Target Container -->
		<div class="space-y-4">
			<h2 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">Red Fruits Only</h2>
			<div
				class={`min-h-[400px] rounded-lg border bg-white p-4 shadow-sm transition-all
					${
						dndState.isDragging
							? dndState.invalidDrop
								? 'border-red-500/50 bg-red-50/5'
								: 'border-blue-500/50 bg-blue-50/5'
							: ''
					}`}
					
				use:droppable={{
					container: 'target',
					callbacks: dragDropCallbacks,
					attributes: {
						dragOverClass: dndState.invalidDrop ? 'invalid-drop' : 'valid-drop'
					}
				}}
			>
				{#if isTargetEmpty}
					<div class="flex h-full items-center justify-center">
						<p class="text-muted-foreground">Drop red fruits here</p>
					</div>
				{:else}
					<div class="grid gap-2">
						{#each targetFruits as fruit}
							<div class="flex items-center justify-between rounded-md border-red-200 bg-red-50/50 p-3 shadow-sm">
								<span class="font-medium">{fruit.name}</span>
								<span class="rounded bg-red-100 px-2 py-1 text-xs text-red-700">{fruit.color}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.valid-drop {
		@apply border-blue-500/50 bg-blue-50/5 ring-2 ring-blue-500/20 ring-offset-2;
	}
	.invalid-drop {
		@apply border-red-500/50 bg-red-50/5 ring-2 ring-red-500/20 ring-offset-2;
	}
</style>
