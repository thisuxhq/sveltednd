<script lang="ts">
	import { droppable, draggable, type DragDropState } from '$lib/index.js';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
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
			title: 'development tasks',
			description: 'technical implementation tasks',
			items: [
				{
					id: 'dev1',
					title: 'setup project',
					description: 'initialize repository and configure tools',
					priority: 'high'
				},
				{
					id: 'dev2',
					title: 'create components',
					description: 'build reusable ui components',
					priority: 'medium'
				}
			]
		},
		{
			id: 'group2',
			title: 'design tasks',
			description: 'ui/ux design related tasks',
			items: [
				{
					id: 'design1',
					title: 'color palette',
					description: 'define brand colors and variants',
					priority: 'high'
				},
				{
					id: 'design2',
					title: 'typography',
					description: 'select and implement fonts',
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

		sourceGroup.items = sourceGroup.items.filter((item: DraggedItem) => item.id !== draggedItem.id);

		targetGroup.items = [
			...targetGroup.items.slice(0, targetIndex),
			draggedItem,
			...targetGroup.items.slice(targetIndex)
		];

		groups = [...groups];
	}

	const getPriorityMarker = (priority: Item['priority']) => {
		return {
			low: 'bg-swiss-gray dark:bg-white/20',
			medium: 'bg-swiss-dark-gray dark:bg-white/40',
			high: 'bg-swiss-red'
		}[priority];
	};
</script>

<svelte:head>
	<title>Nested Containers - SvelteDnD Examples</title>
	<meta
		name="description"
		content="Build complex drag and drop interfaces with nested containers. Move items within and between parent containers."
	/>
	<meta property="og:title" content="Nested Containers - SvelteDnD" />
	<meta
		property="og:description"
		content="Nested drag and drop containers example with SvelteDnD"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://sveltednd.thisux.com/nested" />
	<meta name="twitter:title" content="Nested Containers - SvelteDnD" />
	<meta
		name="twitter:description"
		content="Nested drag and drop containers example with SvelteDnD"
	/>
</svelte:head>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">nested containers</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			drag items within groups and between different groups
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="grid gap-8 md:grid-cols-2">
			{#each groups as group, groupIndex (group.id)}
				<div
					use:droppable={{
						container: groupIndex.toString(),
						callbacks: { onDrop: handleGroupDrop }
					}}
					animate:flip={{ duration: 200 }}
				>
					<div
						use:draggable={{
							container: groupIndex.toString(),
							dragData: group
						}}
						class="svelte-dnd-touch-feedback border border-swiss-black bg-white dark:border-white/20 dark:bg-swiss-black"
						in:fade={{ duration: 150 }}
						out:fade={{ duration: 150 }}
					>
						<!-- Group Header -->
						<div class="border-b border-swiss-black p-6 dark:border-white/20">
							<div class="flex items-start justify-between">
								<div>
									<h2 class="text-lg text-swiss-black dark:text-white">{group.title}</h2>
									<p class="mt-1 text-xs text-swiss-mid-gray dark:text-white/60">
										{group.description}
									</p>
								</div>
								<span class="text-xs text-swiss-mid-gray dark:text-white/60"
									>{group.items.length.toString().padStart(2, '0')}</span
								>
							</div>
						</div>

						<!-- Group Items -->
						<div class="divide-y divide-swiss-gray dark:divide-white/10">
							{#each group.items as item, itemIndex (item.id)}
								<div
									use:droppable={{
										container: `${group.id}:${itemIndex}`,
										callbacks: {
											onDrop: (state: DragDropState<DraggedItem>) => handleItemDrop(group.id, state)
										}
									}}
								>
									<div
										use:draggable={{
											container: `${group.id}:${itemIndex}`,
											dragData: item
										}}
										class="svelte-dnd-touch-feedback cursor-move bg-white p-6 transition-all hover:bg-swiss-gray dark:bg-swiss-black dark:hover:bg-white/10"
									>
										<div class="flex items-start justify-between">
											<div>
												<h3 class="text-sm text-swiss-black dark:text-white">{item.title}</h3>
												<p class="mt-1 text-xs text-swiss-mid-gray dark:text-white/60">
													{item.description}
												</p>
											</div>
											<div class="h-2 w-2 {getPriorityMarker(item.priority)}"></div>
										</div>
									</div>
								</div>
							{/each}
						</div>
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

	.dark :global(.dragging) {
		opacity: 0.5;
		outline: 1px solid rgba(255, 255, 255, 0.5);
	}

	.dark :global(.drag-over) {
		background-color: rgba(255, 255, 255, 0.1);
		outline: 1px dashed rgba(255, 255, 255, 0.3);
	}
</style>
