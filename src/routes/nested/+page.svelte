<script lang="ts">
	import { droppable, draggable, type DragDropState } from '$lib/index.js';
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import '$lib/styles/dnd.css';
	import SeoHead from '$lib/components/SeoHead.svelte';

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

	type NestedDragPayload =
		| { kind: 'group'; group: Group }
		| { kind: 'item'; item: Item; groupId: string };

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

	/** Reorder groups when a group is dropped onto another group shell. */
	function handleGroupDrop(state: DragDropState<NestedDragPayload>) {
		const { draggedItem, targetContainer } = state;
		if (!draggedItem || draggedItem.kind !== 'group' || !targetContainer) return;

		const sourceIndex = groups.findIndex((g) => g.id === draggedItem.group.id);
		const targetIndex = groups.findIndex((g) => g.id === targetContainer);
		if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

		const next = [...groups];
		const [moved] = next.splice(sourceIndex, 1);
		next.splice(targetIndex, 0, moved);
		groups = next;
	}

	/**
	 * Move or reorder items within / across groups.
	 * Item drop targets use container ids: `item:{groupId}:{itemId}` or `list:{groupId}`.
	 */
	function handleItemDrop(state: DragDropState<NestedDragPayload>) {
		const { draggedItem, targetContainer, dropPosition } = state;
		if (!draggedItem || draggedItem.kind !== 'item' || !targetContainer) return;

		const item = draggedItem.item;
		const sourceGroupId = draggedItem.groupId;

		let targetGroupId: string;
		let targetIndex: number;

		if (targetContainer.startsWith('list:')) {
			// Dropped on empty list body — append to that group
			targetGroupId = targetContainer.slice('list:'.length);
			const targetGroup = groups.find((g) => g.id === targetGroupId);
			if (!targetGroup) return;
			targetIndex = targetGroup.items.length;
		} else if (targetContainer.startsWith('item:')) {
			// item:{groupId}:{itemId}
			const parts = targetContainer.split(':');
			targetGroupId = parts[1] ?? '';
			const targetItemId = parts[2] ?? '';
			const targetGroup = groups.find((g) => g.id === targetGroupId);
			if (!targetGroup) return;
			const idx = targetGroup.items.findIndex((i) => i.id === targetItemId);
			if (idx === -1) return;
			targetIndex = dropPosition === 'after' ? idx + 1 : idx;
		} else {
			return;
		}

		const sourceGroup = groups.find((g) => g.id === sourceGroupId);
		const targetGroup = groups.find((g) => g.id === targetGroupId);
		if (!sourceGroup || !targetGroup) return;

		// Remove from source
		const fromIndex = sourceGroup.items.findIndex((i) => i.id === item.id);
		if (fromIndex === -1) return;
		sourceGroup.items = sourceGroup.items.filter((i) => i.id !== item.id);

		// Adjust target index when moving within the same group after the original index
		if (sourceGroupId === targetGroupId && fromIndex < targetIndex) {
			targetIndex -= 1;
		}

		targetGroup.items = [
			...targetGroup.items.slice(0, targetIndex),
			item,
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

<SeoHead
	title="Nested containers"
	description="Nested drag and drop containers. Reorder groups and move items within and between parent zones."
	path="/nested"
/>

<div class="min-h-screen pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">nested containers</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			drag groups to reorder them · drag items within a group or between groups
		</p>
	</header>

	<!-- Content -->
	<div class="p-8 md:p-16">
		<div class="grid gap-8 md:grid-cols-2">
			{#each groups as group (group.id)}
				<!-- Group shell: accepts other groups for reordering -->
				<div
					use:droppable={{
						container: group.id,
						callbacks: { onDrop: handleGroupDrop }
					}}
					animate:flip={{ duration: 200 }}
				>
					<div
						class="svelte-dnd-touch-feedback border border-swiss-black bg-white dark:border-white/20 dark:bg-swiss-black"
						in:fade={{ duration: 150 }}
						out:fade={{ duration: 150 }}
					>
						<!-- Group header is the group drag handle / surface -->
						<div
							use:draggable={{
								container: group.id,
								dragData: { kind: 'group', group } satisfies NestedDragPayload,
								handle: '.group-drag-handle'
							}}
							class="border-b border-swiss-black p-6 dark:border-white/20"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="flex items-start gap-3">
									<span
										class="group-drag-handle mt-0.5 cursor-grab select-none text-swiss-mid-gray dark:text-white/50"
										aria-hidden="true"
									>
										⋮⋮
									</span>
									<div>
										<h2 class="text-lg text-swiss-black dark:text-white">{group.title}</h2>
										<p class="mt-1 text-xs text-swiss-mid-gray dark:text-white/60">
											{group.description}
										</p>
									</div>
								</div>
								<span class="text-xs text-swiss-mid-gray dark:text-white/60"
									>{group.items.length.toString().padStart(2, '0')}</span
								>
							</div>
						</div>

						<!-- Item list body: accepts items (including empty groups) -->
						<div
							use:droppable={{
								container: `list:${group.id}`,
								callbacks: { onDrop: handleItemDrop }
							}}
							class="min-h-16 divide-y divide-swiss-gray dark:divide-white/10"
						>
							{#each group.items as item (item.id)}
								<div
									use:droppable={{
										container: `item:${group.id}:${item.id}`,
										callbacks: { onDrop: handleItemDrop }
									}}
									animate:flip={{ duration: 150 }}
								>
									<div
										use:draggable={{
											container: `item:${group.id}:${item.id}`,
											dragData: {
												kind: 'item',
												item,
												groupId: group.id
											} satisfies NestedDragPayload
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
