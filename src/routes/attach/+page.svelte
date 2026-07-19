<script lang="ts">
	import { attachDraggable, attachDroppable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import '$lib/styles/dnd.css';
	import Card from './Card.svelte';
	import Column from './Column.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	interface Task {
		id: string;
		title: string;
		status: 'todo' | 'doing' | 'done';
	}

	let tasks = $state<Task[]>([
		{ id: '1', title: 'use attachDraggable on a component', status: 'todo' },
		{ id: '2', title: 'spread {...props} on the root element', status: 'doing' },
		{ id: '3', title: 'drop with attachDroppable', status: 'done' },
		{ id: '4', title: 'keep use: actions for plain HTML', status: 'todo' }
	]);

	const columns = [
		{ id: 'todo' as const, title: 'todo' },
		{ id: 'doing' as const, title: 'doing' },
		{ id: 'done' as const, title: 'done' }
	];

	function handleDrop(state: DragDropState<Task>) {
		const { draggedItem, targetContainer } = state;
		if (!draggedItem || !targetContainer) return;
		if (!columns.some((c) => c.id === targetContainer)) return;

		tasks = tasks.map((t) =>
			t.id === draggedItem.id ? { ...t, status: targetContainer as Task['status'] } : t
		);
	}
</script>

<SeoHead
	title="Attachments"
	description="Use attachDraggable and attachDroppable with Svelte 5 attachments on components that spread root props."
	path="/attach"
/>

<div class="min-h-screen pt-20 md:pt-0">
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">
			attachments <span class="text-swiss-mid-gray dark:text-white/40">{`{@attach}`}</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm text-swiss-mid-gray dark:text-white/60">
			<code class="text-swiss-black dark:text-white">attachDraggable</code> /
			<code class="text-swiss-black dark:text-white">attachDroppable</code> work on components that
			spread props onto a root element (Svelte 5.29+). Drag cards between columns — each card and
			column is a Svelte component, not a bare
			<code class="text-swiss-black dark:text-white">&lt;div&gt;</code>.
		</p>
	</header>

	<div class="p-8 md:p-16">
		<div class="grid gap-6 md:grid-cols-3">
			{#each columns as column (column.id)}
				<Column
					title={column.title}
					class="min-h-64 border border-swiss-black bg-white dark:border-white/20 dark:bg-swiss-black"
					{@attach attachDroppable<Task>(() => ({
						container: column.id,
						callbacks: { onDrop: handleDrop }
					}))}
				>
					{#each tasks.filter((t) => t.status === column.id) as task (task.id)}
						<div animate:flip={{ duration: 180 }}>
							<Card
								class="svelte-dnd-touch-feedback cursor-move border border-swiss-gray bg-swiss-gray/40 p-4 text-sm text-swiss-black dark:border-white/10 dark:bg-white/5 dark:text-white"
								{@attach attachDraggable(() => ({
									container: column.id,
									dragData: task
								}))}
							>
								{task.title}
							</Card>
						</div>
					{/each}
				</Column>
			{/each}
		</div>

		<section class="mt-12 max-w-2xl border-t border-swiss-gray pt-8 dark:border-white/10">
			<h2 class="text-sm text-swiss-black dark:text-white">pattern</h2>
			<pre
				class="mt-4 overflow-x-auto bg-swiss-gray p-4 text-xs text-swiss-black dark:bg-white/5 dark:text-white/80"><code
					>{`<!-- Component spreads props to root -->
<div {...props}>{@render children?.()}</div>

<!-- Consumer -->
<Card {@attach attachDraggable(() => ({
  container: 'todo',
  dragData: task
}))}>
  {task.title}
</Card>`}</code
				></pre>
		</section>
	</div>
</div>

<style>
	:global(.dragging) {
		opacity: 0.5;
		outline: 1px solid #0a0a0a;
	}

	:global(.drag-over) {
		outline: 1px dashed #a3a3a3;
		background-color: #f5f5f5;
	}

	:global(.dark .dragging) {
		outline: 1px solid rgba(255, 255, 255, 0.5);
	}

	:global(.dark .drag-over) {
		outline: 1px dashed rgba(255, 255, 255, 0.3);
		background-color: rgba(255, 255, 255, 0.08);
	}
</style>
