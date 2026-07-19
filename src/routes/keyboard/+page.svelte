<script lang="ts">
	import { draggable, droppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import '$lib/styles/dnd.css';
	import SeoHead from '$lib/components/SeoHead.svelte';

	interface Item {
		id: string;
		title: string;
		description: string;
	}

	let items = $state<Item[]>([
		{
			id: '1',
			title: 'design system updates',
			description: 'Tab here, press Space to grab, arrows to move, Space to drop'
		},
		{
			id: '2',
			title: 'user research',
			description: 'Escape cancels a keyboard drag'
		},
		{
			id: '3',
			title: 'api documentation',
			description: 'Mouse and touch still work the same'
		},
		{
			id: '4',
			title: 'accessibility review',
			description: 'Screen readers get assertive live announcements'
		}
	]);

	function handleDrop(state: DragDropState<Item>) {
		const { draggedItem, targetContainer, dropPosition } = state;
		const dragIndex = items.findIndex((item) => item.id === draggedItem.id);
		let dropIndex = parseInt(targetContainer ?? '0');
		if (dropPosition === 'after') dropIndex += 1;

		if (dragIndex !== -1 && !isNaN(dropIndex)) {
			const next = [...items];
			const [item] = next.splice(dragIndex, 1);
			const adjusted = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
			next.splice(adjusted, 0, item);
			items = next;
		}
	}
</script>

<SeoHead
	title="Keyboard accessibility"
	description="Keyboard reordering with Space, arrow keys, and Escape. Opt-in accessibility for SvelteDnD with live announcements."
	path="/keyboard"
/>

<div class="min-h-screen pt-20 md:pt-0">
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">keyboard accessibility</h1>
		<p class="mt-4 max-w-2xl text-sm text-swiss-mid-gray dark:text-white/60">
			Opt-in with <code class="text-swiss-black dark:text-white">keyboard: true</code> on
			<code class="text-swiss-black dark:text-white">draggable</code>. Same
			<code class="text-swiss-black dark:text-white">onDrop</code> handler as mouse and touch.
		</p>
		<ul class="mt-6 max-w-xl space-y-1 text-xs text-swiss-mid-gray dark:text-white/50">
			<li><strong class="text-swiss-black dark:text-white">Tab</strong> — focus an item</li>
			<li>
				<strong class="text-swiss-black dark:text-white">Space / Enter</strong> — pick up or drop
			</li>
			<li>
				<strong class="text-swiss-black dark:text-white">↑ / ↓</strong> — move drop preview
			</li>
			<li><strong class="text-swiss-black dark:text-white">Escape</strong> — cancel</li>
		</ul>
	</header>

	<div class="p-8 md:p-16">
		<div class="max-w-2xl">
			<div
				class="border border-swiss-black dark:border-white/20"
				role="list"
				aria-label="Reorderable tasks"
			>
				{#each items as item, index (item.id)}
					<div
						role="listitem"
						use:draggable={{
							container: index.toString(),
							dragData: item,
							keyboard: true
						}}
						use:droppable={{
							container: index.toString(),
							callbacks: { onDrop: handleDrop }
						}}
						animate:flip={{ duration: 200 }}
						in:fade={{ duration: 150 }}
						out:fade={{ duration: 150 }}
						class="svelte-dnd-touch-feedback cursor-move border-b border-swiss-black bg-white p-6 transition-all last:border-b-0 hover:bg-swiss-gray focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-swiss-red dark:border-white/20 dark:bg-swiss-black dark:hover:bg-white/10"
					>
						<div class="flex items-start gap-6">
							<span class="text-xs text-swiss-mid-gray dark:text-white/60"
								>{(index + 1).toString().padStart(2, '0')}</span
							>
							<div class="flex-1">
								<h2 class="text-sm text-swiss-black dark:text-white">{item.title}</h2>
								<p class="mt-1 text-xs text-swiss-mid-gray dark:text-white/60">
									{item.description}
								</p>
							</div>
						</div>
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

	:global(.drag-over) {
		background-color: #f5f5f5;
		outline: 1px dashed #a3a3a3;
	}

	:global(.dark .dragging) {
		outline: 1px solid rgba(255, 255, 255, 0.5);
	}

	:global(.dark .drag-over) {
		background-color: rgba(255, 255, 255, 0.1);
		outline: 1px dashed rgba(255, 255, 255, 0.3);
	}
</style>
