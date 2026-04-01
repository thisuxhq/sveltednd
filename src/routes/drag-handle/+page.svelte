<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	interface Item {
		id: string;
		title: string;
		description: string;
	}

	const items = $state<Item[]>([
		{ id: '1', title: 'review pull requests', description: 'check open prs on github' },
		{ id: '2', title: 'update documentation', description: 'add new api examples' },
		{ id: '3', title: 'fix login bug', description: 'users unable to reset password' },
		{ id: '4', title: 'deploy to staging', description: 'push latest changes for qa' }
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
</script>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black md:text-4xl">drag handle</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray">
			only the grip icon starts a drag. text remains selectable.
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="max-w-xl">
			<div class="border border-swiss-black">
				{#each items as item, index (item.id)}
					<div
						use:draggable={{
							container: index.toString(),
							dragData: item,
							handle: '.drag-handle'
						}}
						use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop }
						}}
						animate:flip={{ duration: 200 }}
						in:fade={{ duration: 150 }}
						out:fade={{ duration: 150 }}
						class="flex items-start gap-4 border-b border-swiss-black bg-white p-6 transition-all last:border-b-0 hover:bg-swiss-gray"
					>
						<button
							aria-label="drag to reorder"
							class="drag-handle mt-1 cursor-grab text-swiss-mid-gray transition-colors hover:text-swiss-black active:cursor-grabbing"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
								<circle cx="9" cy="5" r="1.5" />
								<circle cx="15" cy="5" r="1.5" />
								<circle cx="9" cy="12" r="1.5" />
								<circle cx="15" cy="12" r="1.5" />
								<circle cx="9" cy="19" r="1.5" />
								<circle cx="15" cy="19" r="1.5" />
							</svg>
						</button>
						<div class="flex-1">
							<h3 class="text-sm text-swiss-black">{item.title}</h3>
							<p class="mt-1 text-xs text-swiss-mid-gray">{item.description}</p>
						</div>
						<span class="text-xs text-swiss-mid-gray"
							>{(index + 1).toString().padStart(2, '0')}</span
						>
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
</style>
