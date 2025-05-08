<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';

	interface Item {
		id: string;
		title: string;
	}

	let items = $state<Item[]>([
		{ id: '1', title: 'This list is interactive' },
		{ id: '2', title: 'You can drag and drop items' },
		{ id: '3', title: 'You can also select items' },
		{ id: '4', title: 'You can also delete items' }
	]);

	function handleDelete(id: string) {
		items = items.filter((item) => item.id !== id);
	}

	function handleSelect(id: string) {
		console.log('Selected item:', id);
		alert('Selected item: ' + id);
	}

	function handleDrop(state: DragDropState<Item>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		if (!targetContainer || sourceContainer === targetContainer) return;

		const sourceIndex = items.findIndex((item) => item.id === draggedItem.id);
		const targetIndex = parseInt(targetContainer);

		const [movedItem] = items.splice(sourceIndex, 1);
		items.splice(targetIndex, 0, movedItem);
		items = [...items]; // Force reactivity
	}
</script>

<div class="container mx-auto p-8">
	<div class="mb-8 flex flex-col gap-2">
		<h1 class="text-2xl font-bold">Interactive Draggable List</h1>
		<p class="text-gray-600">
			Try clicking the items or delete buttons while also being able to drag and reorder the list.
		</p>
	</div>

	<div class="space-y-2">
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
					interactive: ['[data-delete-btn]', '[data-select-btn]', '.interactive']
				}}
				class="flex items-center select-none touch-none md:select-auto md:touch-auto justify-between rounded-lg bg-white p-4 shadow transition-all hover:shadow-md"
			>
				<button
					data-select-btn
					class="interactive flex-1 text-left hover:text-blue-600"
					onclick={() => handleSelect(item.id)}
				>
					{item.title}
				</button>

				<button
					data-delete-btn
					class="ml-2 text-red-500 hover:text-red-700"
					onclick={() => handleDelete(item.id)}
				>
					Delete
				</button>
			</div>
		{/each}
	</div>
</div>
