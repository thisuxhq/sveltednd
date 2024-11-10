<script lang="ts">
	import { droppable, draggable, type DragDropState } from '$lib/index.js';
	import { fade } from 'svelte/transition';
	import '$lib/styles/dnd.css';

	interface Item {
		id: string;
		title: string;
		description: string;
		priority: 'low' | 'medium' | 'high';
	}

	interface Group {
		id: string;
		title: string;
		description: string;
		items: Item[];
	}

	interface DraggedItem {
		id: string;
		title: string;
		description: string;
		priority: 'low' | 'medium' | 'high';
	}

	let groups = $state<Group[]>([
		{
			id: 'group1',
			title: 'Development Tasks',
			description: 'Technical implementation tasks',
			items: [
				{
					id: 'dev1',
					title: 'Setup Project',
					description: 'Initialize repository and configure tools',
					priority: 'high'
				},
				{
					id: 'dev2',
					title: 'Create Components',
					description: 'Build reusable UI components',
					priority: 'medium'
				}
			]
		},
		{
			id: 'group2',
			title: 'Design Tasks',
			description: 'UI/UX design related tasks',
			items: [
				{
					id: 'design1',
					title: 'Color Palette',
					description: 'Define brand colors and variants',
					priority: 'high'
				},
				{
					id: 'design2',
					title: 'Typography',
					description: 'Select and implement fonts',
					priority: 'low'
				}
			]
		}
	]);

	function handleGroupDrop(state: DragDropState<DraggedItem>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		if (!targetContainer || sourceContainer === targetContainer) return;

		const sourceIndex = groups.findIndex((g) => g.id === draggedItem.id);
		const targetIndex = parseInt(targetContainer);

		const [movedGroup] = groups.splice(sourceIndex, 1);
		groups = [...groups.slice(0, targetIndex), movedGroup, ...groups.slice(targetIndex)];
	}

	function handleItemDrop(groupId: string, state: DragDropState<DraggedItem>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		if (!targetContainer || !draggedItem) return;

		const [sourceGroupId] = sourceContainer.split(':');
		const [targetGroupId, targetIndexStr] = targetContainer.split(':');
		const targetIndex = parseInt(targetIndexStr);

		const sourceGroup = groups.find((g) => g.id === sourceGroupId);
		const targetGroup = groups.find((g) => g.id === targetGroupId);

		if (!sourceGroup || !targetGroup) return;

		// Remove from source
		sourceGroup.items = sourceGroup.items.filter((item: DraggedItem) => item.id !== draggedItem.id);

		// Add to target
		targetGroup.items = [
			...targetGroup.items.slice(0, targetIndex),
			draggedItem,
			...targetGroup.items.slice(targetIndex)
		];

		// Force reactivity
		groups = [...groups];
	}

	const getPriorityColor = (priority: Item['priority']) => {
		return {
			low: 'bg-blue-50 text-blue-700',
			medium: 'bg-yellow-50 text-yellow-700',
			high: 'bg-red-50 text-red-700'
		}[priority];
	};
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<h1 class="mb-8 text-2xl font-bold text-gray-900">Nested Containers</h1>

	<div class="flex flex-col gap-6">
		{#each groups as group, groupIndex (group.id)}
			<div
				use:droppable={{
					container: groupIndex.toString(),
					callbacks: { onDrop: handleGroupDrop }
				}}
			>
				<div
					use:draggable={{
						container: groupIndex.toString(),
						dragData: group
					}}
					class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
					in:fade={{ duration: 150 }}
					out:fade={{ duration: 150 }}
				>
					<!-- Group Header -->
					<div class="mb-4 flex items-center justify-between">
						<div>
							<h2 class="font-semibold text-gray-900">{group.title}</h2>
							<p class="text-sm text-gray-500">{group.description}</p>
						</div>
						<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
							{group.items.length}
						</span>
					</div>

					<!-- Group Items -->
					<div class="space-y-3">
						{#each group.items as item, itemIndex (item.id)}
							<div
								use:droppable={{
									container: `${group.id}:${itemIndex}`,
									callbacks: {
										onDrop: (state) => handleItemDrop(group.id, state)
									}
								}}
							>
								<div
									use:draggable={{
										container: `${group.id}:${itemIndex}`,
										dragData: item
									}}
									class="cursor-move rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200
                                           transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-200"
								>
									<div class="mb-2 flex items-start justify-between gap-2">
										<h3 class="font-medium text-gray-900">{item.title}</h3>
										<span
											class={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
												item.priority
											)}`}
										>
											{item.priority}
										</span>
									</div>
									<p class="text-sm text-gray-500">{item.description}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	:global(.dragging) {
		@apply opacity-50 shadow-lg ring-2 ring-blue-400;
	}

	:global(.drag-over) {
		@apply bg-blue-50 ring-2 ring-blue-400;
	}
</style>
