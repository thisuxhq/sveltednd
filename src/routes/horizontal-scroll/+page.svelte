<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import '$lib/styles/dnd.css';

	interface ImageItem {
		id: string;
		url: string;
	}

	let images = $state<ImageItem[]>([
		{ id: '1', url: 'https://picsum.photos/200/300?1' },
		{ id: '2', url: 'https://picsum.photos/200/300?2' },
		{ id: '3', url: 'https://picsum.photos/200/300?3' },
		{ id: '4', url: 'https://picsum.photos/200/300?4' }
	]);

	function handleDrop({ draggedItem, sourceContainer, targetContainer }: DragDropState<ImageItem>) {
		if (!targetContainer || sourceContainer === targetContainer) return; // Prevent self-placement

		images = images.filter((img: ImageItem) => img.id !== draggedItem.id); // Remove the dragged item
		images.splice(parseInt(targetContainer), 0, draggedItem); // Insert the dragged item at the new position
	}
</script>

<div class="flex min-h-screen flex-col gap-4 p-8">
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-bold">Horizontal Image Gallery</h1>
		<p class="text-gray-600">Drag and drop images to rearrange them in the gallery.</p>
	</div>

	<div class="flex gap-4 overflow-x-auto p-4">
		{#each images as image, index (image.id)}
			<div
				use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
				class="relative"
			>
				<div
					use:draggable={{
						container: index.toString(),
						dragData: image
					}}
					class="group relative h-[300px] w-[200px] cursor-move overflow-hidden rounded-xl
							transition-transform hover:scale-105"
				>
					<img
						src={image.url}
						alt=""
						class="h-full w-full object-cover transition-transform duration-700
								group-hover:scale-105"
					/>
					<!-- ... existing overlay code ... -->
				</div>

				<!-- Added position indicator -->
				<div
					class="absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/90
								px-4 py-1.5 text-sm font-medium text-zinc-600 backdrop-blur-sm
								transition-all group-hover:bg-white"
				>
					{index + 1}
				</div>
			</div>
		{/each}
	</div>
</div>
