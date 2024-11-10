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
			title: 'Design System Updates',
			description: 'Update color palette and component library',
			status: 'todo',
			priority: 'high'
		},
		{
			id: '2',
			title: 'User Research',
			description: 'Conduct interviews with 5 key customers',
			status: 'in-progress',
			priority: 'medium'
		},
		{
			id: '3',
			title: 'API Documentation',
			description: 'Document new endpoints and examples',
			status: 'todo',
			priority: 'low'
		},
		{
			id: '4',
			title: 'Performance Audit',
			description: 'Analyze and optimize load times',
			status: 'in-progress',
			priority: 'high'
		},
		{
			id: '5',
			title: 'Bug Fixes',
			description: 'Fix reported authentication issues',
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
		if (!targetContainer) return; // Prevent self-placement

		// Update the task's status to the target container
		tasks = tasks.map((task: Task) => {
			if (task.id === draggedItem.id) {
				task.status = targetContainer as TaskStatus;
			}
			return task;
		});
	}

	const getPriorityColor = (priority: Task['priority']) => {
		return {
			low: 'bg-blue-50 text-blue-700',
			medium: 'bg-yellow-50 text-yellow-700',
			high: 'bg-red-50 text-red-700'
		}[priority];
	};
</script>

<div class="min-h-screen overflow-hidden bg-gray-50 p-8">
	<div class="mb-8 flex flex-col gap-2">
		<h1 class="text-2xl font-bold text-gray-900">Kanban Board</h1>
		<p class="text-gray-600">Drag and drop tasks between columns to reorder them in the board.</p>
	</div>

	<div class="flex gap-6 overflow-x-auto p-2">
		{#each tasksByStatus as { status, items }}
			<div class="w-80 flex-none">
				<div
					class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
					use:droppable={{
						// The container is the status of the task. e.g. 'todo', 'in-progress', 'done'
						container: status,
						// When a task is dropped, the handleDrop function is called to update the task's status
						callbacks: { onDrop: handleDrop }
					}}
				>
					<div class="mb-4 flex items-center justify-between">
						<h2 class="font-semibold capitalize text-gray-900">
							{status.replace('-', ' ')}
						</h2>
						<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600">
							{items.length}
						</span>
					</div>

					<div class="space-y-3">
						{#each items as task (task.id)}
							<div
								use:draggable={{
									// The container is the status of the task. e.g. 'todo', 'in-progress', 'done'
									container: status,
									// The dragData is the task that is being dragged
									dragData: task
								}}
								animate:flip={{ duration: 200 }}
								in:fade={{ duration: 150 }}
								out:fade={{ duration: 150 }}
								class="cursor-move rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200
                                       transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-200"
							>
								<div class="mb-2 flex items-start justify-between gap-2">
									<h3 class="font-medium text-gray-900">
										{task.title}
									</h3>
									<span
										class={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
											task.priority
										)}`}
									>
										{task.priority}
									</span>
								</div>
								<p class="text-sm text-gray-500">
									{task.description}
								</p>
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
