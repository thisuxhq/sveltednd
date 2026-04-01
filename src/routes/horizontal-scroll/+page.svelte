<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import '$lib/styles/dnd.css';

	interface ImageItem {
		id: string;
		url: string;
	}

	let images = $state<ImageItem[]>([
		{ id: '1', url: 'https://picsum.photos/300/400?1' },
		{ id: '2', url: 'https://picsum.photos/300/400?2' },
		{ id: '3', url: 'https://picsum.photos/300/400?3' },
		{ id: '4', url: 'https://picsum.photos/300/400?4' }
	]);

	function handleDrop(state: DragDropState<ImageItem>) {
		const { draggedItem, targetContainer } = state;
		const dragIndex = images.findIndex((img) => img.id === draggedItem.id);
		const dropIndex = parseInt(targetContainer ?? '0');

		if (dragIndex !== -1 && !isNaN(dropIndex)) {
			const [item] = images.splice(dragIndex, 1);
			images.splice(dropIndex, 0, item);
		}
	}
</script>

<div class="h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black md:text-4xl">horizontal scroll</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray">
			drag and drop images to rearrange them in the gallery
		</p>
	</header>

	<!-- Content - scrollable area only -->
	<div class="overflow-x-auto p-8 md:p-16">
		<div class="flex gap-6 pb-8">
			{#each images as image, index (image.id)}
				<div
					use:draggable={{ container: index.toString(), dragData: image }}
					use:droppable={{
						container: index.toString(),
						direction: 'horizontal',
						callbacks: { onDrop: handleDrop }
					}}
					class="svelte-dnd-touch-feedback relative flex-none p-4"
					animate:flip={{ duration: 200 }}
					in:fade={{ duration: 150 }}
					out:fade={{ duration: 150 }}
				>
					<div
						class="group relative h-[400px] w-[300px] cursor-move overflow-hidden border border-swiss-black"
					>
						<img
							src={image.url}
							alt=""
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					</div>
					<div class="mt-4 text-center">
						<span class="text-xs text-swiss-mid-gray"
							>{(index + 1).toString().padStart(2, '0')}</span
						>
					</div>
				</div>
			{/each}
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
</style>
