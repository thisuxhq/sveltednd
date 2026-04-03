<script lang="ts">
	import { droppable, draggable, type DragDropState } from '$lib/index.js';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import '$lib/styles/dnd.css';

	type TaskStatus = 'todo' | 'in-progress' | 'done';
	interface Task {
		id: string;
		title: string;
		description: string;
		status: TaskStatus;
		priority: 'low' | 'medium' | 'high';
	}

	let tasks = $state<Task[]>([
		{
			id: '1',
			title: 'design system updates',
			description: 'update color palette and component library',
			status: 'todo',
			priority: 'high'
		},
		{
			id: '2',
			title: 'user research',
			description: 'conduct interviews with 5 key customers',
			status: 'in-progress',
			priority: 'medium'
		},
		{
			id: '3',
			title: 'api documentation',
			description: 'document new endpoints and examples',
			status: 'todo',
			priority: 'low'
		},
		{
			id: '4',
			title: 'performance audit',
			description: 'analyze and optimize load times',
			status: 'in-progress',
			priority: 'high'
		},
		{
			id: '5',
			title: 'bug fixes',
			description: 'fix reported authentication issues',
			status: 'done',
			priority: 'high'
		}
	]);

	const columns: TaskStatus[] = ['todo', 'in-progress', 'done'];
	const tasksByStatus = $derived(
		columns.map((status) => ({
			status,
			items: tasks.filter((task) => task.status === status)
		}))
	);

	async function handleDrop(state: DragDropState<Task>) {
		const { draggedItem, targetContainer } = state;
		if (!targetContainer) return;

		tasks = tasks.map((task: Task) => {
			if (task.id === draggedItem.id) {
				task.status = targetContainer as TaskStatus;
			}
			return task;
		});
	}

	const getPriorityMarker = (priority: Task['priority']) => {
		return {
			low: 'bg-swiss-gray dark:bg-white/20',
			medium: 'bg-swiss-dark-gray dark:bg-white/40',
			high: 'bg-swiss-red'
		}[priority];
	};
</script>

<svelte:head>
	<title>@thisux/sveltednd - Modern Drag and Drop for Svelte 5</title>
	<meta
		name="description"
		content="A lightweight, type-safe drag and drop library for Svelte 5 applications. Built with TypeScript and Svelte's runes system."
	/>
	<meta property="og:title" content="@thisux/sveltednd - Modern Drag and Drop for Svelte 5" />
	<meta
		property="og:description"
		content="A lightweight, type-safe drag and drop library for Svelte 5 applications. Built with TypeScript and Svelte's runes system."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://sveltednd.thisux.com/" />
	<meta name="twitter:title" content="@thisux/sveltednd - Modern Drag and Drop for Svelte 5" />
	<meta
		name="twitter:description"
		content="A lightweight, type-safe drag and drop library for Svelte 5 applications. Built with TypeScript and Svelte's runes system."
	/>
</svelte:head>

<div class="h-screen overflow-hidden pt-20 md:pt-0">
	<!-- Header -->
	<header class="border-b border-swiss-black px-8 py-12 dark:border-white/20 md:px-16 md:py-16">
		<h1 class="text-3xl text-swiss-black dark:text-white md:text-4xl">kanban board</h1>
		<p class="mt-4 max-w-xl text-sm text-swiss-mid-gray dark:text-white/60">
			drag and drop tasks between columns to update their status
		</p>
	</header>

	<!-- Content -->
	<div class="h-[calc(100vh-200px)] overflow-x-auto p-8 md:p-16">
		<div class="flex h-full gap-8">
			{#each tasksByStatus as { status, items } (status)}
				<div class="flex w-80 flex-none flex-col">
					<!-- Column Header -->
					<div
						class="mb-6 flex items-baseline justify-between border-b border-swiss-black pb-4 dark:border-white/20"
					>
						<h2 class="text-lg text-swiss-black dark:text-white">{status.replace('-', ' ')}</h2>
						<span class="text-xs text-swiss-mid-gray dark:text-white/60"
							>{items.length.toString().padStart(2, '0')}</span
						>
					</div>

					<!-- Drop Zone -->
					<div
						class="flex-1 overflow-y-auto border border-swiss-gray p-4 dark:border-white/10"
						use:droppable={{
							container: status,
							callbacks: { onDrop: handleDrop }
						}}
					>
						<div class="space-y-4">
							{#each items as task (task.id)}
								<div
									use:draggable={{
										container: status,
										dragData: task
									}}
									animate:flip={{ duration: 200 }}
									in:fade={{ duration: 150 }}
									out:fade={{ duration: 150 }}
									class="svelte-dnd-touch-feedback group cursor-move border border-swiss-black bg-white p-4 transition-all hover:shadow-lg dark:border-white/20 dark:bg-swiss-black"
								>
									<div class="mb-3 flex items-start justify-between">
										<h3 class="text-sm text-swiss-black dark:text-white">{task.title}</h3>
										<div class="h-2 w-2 {getPriorityMarker(task.priority)}"></div>
									</div>
									<p class="text-xs leading-relaxed text-swiss-mid-gray dark:text-white/60">
										{task.description}
									</p>
									<div class="mt-3 border-t border-swiss-gray pt-3 dark:border-white/10">
										<span class="text-xs text-swiss-mid-gray dark:text-white/60"
											>{task.priority}</span
										>
									</div>
								</div>
							{/each}
						</div>

						{#if items.length === 0}
							<div class="flex h-32 items-center justify-center">
								<p class="text-xs text-swiss-mid-gray dark:text-white/60">drop tasks here</p>
							</div>
						{/if}
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
