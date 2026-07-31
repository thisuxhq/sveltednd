# Attachments (`{@attach}`)

Svelte **5.29+** attachments apply behavior to elements or to components that spread props onto a DOM root.

## When to use

| Situation                                              | API                                   |
| ------------------------------------------------------ | ------------------------------------- |
| Markup is a plain `<div>` / `<li>` in this file        | `use:draggable` / `use:droppable`     |
| Target is a **child component** (`<Card>`, `<Column>`) | `attachDraggable` / `attachDroppable` |

## Factories

```ts
import { attachDraggable, attachDroppable } from '@thisux/sveltednd';

attachDraggable<T>(options: DraggableOptions<T> | (() => DraggableOptions<T>))
attachDroppable<T>(options: DragDropOptions<T> | (() => DragDropOptions<T>))
```

Same option shapes as the actions. Prefer a **getter** so each attach evaluation reads current `$state`:

```svelte
<Card
	{@attach attachDraggable(() => ({
		container: column.id,
		dragData: task,
		keyboard: true
	}))}
>
	{task.title}
</Card>
```

Static objects work for constant options, but getters avoid stale `dragData` / `container` after list updates.

## Component contract

The component **must** spread received props onto the real DOM node:

```svelte
<!-- Card.svelte -->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let { children, ...props }: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
</script>

<div {...props}>
	{@render children?.()}
</div>
```

Without `{...props}`, the attachment never reaches the DOM and drag will not work.

## Kanban sketch

```svelte
<script lang="ts">
	import { attachDraggable, attachDroppable, type DragDropState } from '@thisux/sveltednd';

	interface Task {
		id: string;
		title: string;
		status: 'todo' | 'doing' | 'done';
	}

	let tasks = $state<Task[]>([
		/* ... */
	]);
	const columns = [
		{ id: 'todo' as const, title: 'Todo' },
		{ id: 'doing' as const, title: 'Doing' },
		{ id: 'done' as const, title: 'Done' }
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

{#each columns as column (column.id)}
	<Column
		{@attach attachDroppable<Task>(() => ({
			container: column.id,
			callbacks: { onDrop: handleDrop }
		}))}
	>
		{#each tasks.filter((t) => t.status === column.id) as task (task.id)}
			<Card
				{@attach attachDraggable(() => ({
					container: column.id,
					dragData: task
				}))}
			>
				{task.title}
			</Card>
		{/each}
	</Column>
{/each}
```

## Mixing actions and attachments

Allowed in one tree: columns as attachments, inner native elements as actions (or the reverse). Pick based on whether the node is a component boundary.

## Gotchas

1. **Svelte version** — attachments need 5.29+. Actions work on earlier Svelte 5.
2. **Stale closures** — use `() => ({ ... })` when options depend on loop variables or `$state`.
3. **No root spread** — silent failure; verify the child forwards props.
4. **Type param** — `attachDroppable<Task>(...)` keeps `onDrop` state typed.
5. **Destroy** — Svelte tears down attachments when the block unmounts; no manual cleanup.

## Demo

Live pattern: https://sveltednd.thisux.com/attach
