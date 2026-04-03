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
		{ id: '1', name: 'apple', color: 'red' },
		{ id: '2', name: 'banana', color: 'yellow' },
		{ id: '3', name: 'grapes', color: 'green' },
		{ id: '4', name: 'orange', color: 'orange' },
		{ id: '5', name: 'pineapple', color: 'yellow' },
		{ id: '6', name: 'strawberry', color: 'red' },
		{ id: '7', name: 'watermelon', color: 'green' }
	]);

	let targetFruits = $state<Fruit[]>([]);

	let isTargetEmpty = $derived(targetFruits.length === 0);
	let isSourceEmpty = $derived(sourceFruits.length === 0);

	function validateDrop(state: DragDropState<Fruit>) {
		const fruit = state.draggedItem;
		if (!fruit) return;
		dndState.invalidDrop = fruit.color !== 'red';
	}

	const dragDropCallbacks = {
		onDragOver: (state: DragDropState<Fruit>) => {
			validateDrop(state);
		},
		onDrop: async (state: DragDropState<Fruit>) => {
			if (dndState.invalidDrop || !state.draggedItem) {
				return;
			}

			sourceFruits = sourceFruits.filter((fruit) => fruit.id !== state.draggedItem.id);
			targetFruits = [...targetFruits, state.draggedItem];
		},
		onDragEnd: () => {
			dndState.invalidDrop = false;
		}
	};
</script>

<svelte:head>
	<title>Conditional Validation - SvelteDnD Examples</title>
	<meta
		name="description"
		content="Implement conditional drop validation with SvelteDnD. Accept or reject drops based on custom logic and data validation."
	/>
	<meta property="og:title" content="Conditional Validation - SvelteDnD" />
	<meta property="og:description" content="Conditional drop validation example with SvelteDnD" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://sveltednd.thisux.com/conditional-check" />
	<meta name="twitter:title" content="Conditional Validation - SvelteDnD" />
	<meta name="twitter:description" content="Conditional drop validation example with SvelteDnD" />
</svelte:head>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">conditional check</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			drop the red fruits in the target zone. other colors will be rejected.
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="grid gap-8 md:grid-cols-2">
			<!-- Source Container -->
			<div>
				<div
					class="mb-6 flex items-baseline justify-between border-b border-swiss-black pb-4 dark:border-white/20"
				>
					<h2 class="text-lg text-swiss-black dark:text-white">available fruits</h2>
					<span class="text-xs text-swiss-mid-gray dark:text-white/60"
						>{sourceFruits.length.toString().padStart(2, '0')}</span
					>
				</div>
				<div
					class="min-h-[400px] border border-swiss-gray p-6 dark:border-white/10"
					use:droppable={{ container: 'source' }}
				>
					{#if isSourceEmpty}
						<div class="flex h-full items-center justify-center">
							<p class="text-xs text-swiss-mid-gray dark:text-white/60">
								all fruits have been sorted
							</p>
						</div>
					{:else}
						<div class="space-y-2">
							{#each sourceFruits as fruit (fruit.name)}
								<div
									use:draggable={{ container: 'source', dragData: fruit }}
									class="group flex items-center justify-between border p-4 transition-all hover:border-swiss-black dark:hover:border-white/50 {fruit.color ===
									'red'
										? 'border-swiss-red bg-swiss-red/5 dark:border-swiss-red'
										: 'border-swiss-gray bg-white dark:border-white/20 dark:bg-swiss-black'}"
								>
									<span class="text-sm text-swiss-black dark:text-white">{fruit.name}</span>
									<span class="text-xs text-swiss-mid-gray dark:text-white/60">{fruit.color}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Target Container -->
			<div>
				<div
					class="mb-6 flex items-baseline justify-between border-b border-swiss-black pb-4 dark:border-white/20"
				>
					<h2 class="text-lg text-swiss-black dark:text-white">red fruits only</h2>
					<span class="text-xs text-swiss-mid-gray dark:text-white/60"
						>{targetFruits.length.toString().padStart(2, '0')}</span
					>
				</div>
				<div
					class="min-h-[400px] border p-6 transition-all {dndState.isDragging
						? dndState.invalidDrop
							? 'border-swiss-red bg-swiss-red/5'
							: 'border-swiss-black bg-swiss-gray dark:border-white/20 dark:bg-white/10'
						: 'border-swiss-gray dark:border-white/10'}"
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
							<p class="text-xs text-swiss-mid-gray dark:text-white/60">drop red fruits here</p>
						</div>
					{:else}
						<div class="space-y-2">
							{#each targetFruits as fruit (fruit.name)}
								<div
									class="flex items-center justify-between border border-swiss-red bg-swiss-red/5 p-4 dark:border-swiss-red"
								>
									<span class="text-sm text-swiss-black dark:text-white">{fruit.name}</span>
									<span class="text-xs text-swiss-red">{fruit.color}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.valid-drop {
		outline: 1px solid #0a0a0a;
	}
	.invalid-drop {
		outline: 1px solid #dc2626;
	}

	.dark .valid-drop {
		outline: 1px solid rgba(255, 255, 255, 0.5);
	}
	.dark .invalid-drop {
		outline: 1px solid #dc2626;
	}
</style>
