# @thisux/sveltednd

A lightweight, flexible drag and drop library for Svelte 5 applications. Built with TypeScript and Svelte's runes system for maximum performance and developer experience.

[![npm version](https://badge.fury.io/js/@thisux%2Fsveltednd.svg)](https://www.npmjs.com/package/@thisux/sveltednd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Svelte 5 Native** — Built on Svelte's `$state` runes for reactive state management
- **Dual-Mode Drag** — HTML5 Drag API for desktop + Pointer Events for touch/mobile support
- **TypeScript-First** — Full type safety with generics support throughout
- **Flexible Layouts** — Vertical, horizontal, and grid layouts with smart drop indicators
- **Drag Handles** — Optional handle selectors for precise drag control
- **Smart Interaction** — Automatically protects interactive elements (inputs, buttons, etc.)
- **Drop Indicators** — Visual feedback showing exactly where items will drop
- **Nested Support** — Works with nested containers and complex hierarchies
- **Lightweight** — Minimal footprint with zero external dependencies

## Installation

```bash
npm install @thisux/sveltednd
# or
bun add @thisux/sveltednd
# or
yarn add @thisux/sveltednd
# or
pnpm add @thisux/sveltednd
```

## Quick Start

```svelte
<script lang="ts">
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';

	let items = $state(['Item 1', 'Item 2', 'Item 3']);

	function handleDrop(state: DragDropState<string>) {
		const { draggedItem, sourceContainer, targetContainer, dropPosition } = state;

		// Simple reordering logic
		const dragIndex = items.indexOf(draggedItem);
		let dropIndex = parseInt(targetContainer ?? '0');
		if (dropPosition === 'after') dropIndex++;

		if (dragIndex !== -1) {
			const [item] = items.splice(dragIndex, 1);
			const adjusted = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
			items.splice(adjusted, 0, item);
		}
	}
</script>

{#each items as item, index (item)}
	<div
		use:draggable={{ container: index.toString(), dragData: item }}
		use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
	>
		{item}
	</div>
{/each}
```

## Core Concepts

### 1. Draggable Items (`use:draggable`)

Make any element draggable with the `draggable` action:

```svelte
<div use:draggable={{ container: 'my-list', dragData: item }}>
	{item.name}
</div>
```

### 2. Droppable Containers (`use:droppable`)

Create drop zones with the `droppable` action:

```svelte
<div use:droppable={{ container: 'my-list', callbacks: { onDrop: handleDrop } }}>
	<!-- Draggable items go here -->
</div>
```

### 3. Global State (`dndState`)

Access real-time drag state anywhere in your app:

```svelte
<script>
	import { dndState } from '@thisux/sveltednd';
</script>

{#if dndState.isDragging}
	<p>Dragging {dndState.draggedItem?.name} from {dndState.sourceContainer}</p>
{/if}
```

## API Reference

### Draggable Options (`DraggableOptions<T>`)

| Property      | Type       | Description                                                               |
| ------------- | ---------- | ------------------------------------------------------------------------- |
| `container`   | `string`   | **Required.** Container identifier for grouping items                     |
| `dragData`    | `T`        | **Required.** Data payload to transfer during drag                        |
| `disabled`    | `boolean`  | Disable dragging for this element                                         |
| `handle`      | `string`   | CSS selector for drag handle (e.g., `'.drag-handle'`)                     |
| `interactive` | `string[]` | Additional selectors for interactive elements that shouldn't trigger drag |
| `callbacks`   | `object`   | Event callbacks (`onDragStart`, `onDragEnd`)                              |
| `attributes`  | `object`   | CSS class overrides (`draggingClass`)                                     |

### Droppable Options (`DragDropOptions<T>`)

| Property     | Type                                   | Description                                                            |
| ------------ | -------------------------------------- | ---------------------------------------------------------------------- |
| `container`  | `string`                               | **Required.** Container identifier                                     |
| `disabled`   | `boolean`                              | Disable dropping for this element                                      |
| `direction`  | `'vertical' \| 'horizontal' \| 'grid'` | Layout direction (default: `'vertical'`)                               |
| `callbacks`  | `object`                               | Event callbacks (`onDragEnter`, `onDragLeave`, `onDragOver`, `onDrop`) |
| `attributes` | `object`                               | CSS class overrides (`dragOverClass`)                                  |

### DragDropState Interface

```typescript
interface DragDropState<T = unknown> {
	isDragging: boolean; // Currently dragging?
	draggedItem: T; // Item being dragged
	sourceContainer: string; // Origin container ID
	targetContainer: string | null; // Current drop target
	targetElement: HTMLElement | null; // Element under cursor
	dropPosition: 'before' | 'after' | null; // Where item will drop
	invalidDrop?: boolean; // Over invalid drop zone?
}
```

### Callbacks

```typescript
interface DragDropCallbacks<T = unknown> {
	onDragStart?: (state: DragDropState<T>) => void;
	onDragEnd?: (state: DragDropState<T>) => void;
	onDragEnter?: (state: DragDropState<T>) => void;
	onDragLeave?: (state: DragDropState<T>) => void;
	onDragOver?: (state: DragDropState<T>) => void;
	onDrop?: (state: DragDropState<T>) => Promise<void> | void;
}
```

## Examples

### Sortable List

```svelte
<script lang="ts">
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';

	interface Task {
		id: string;
		title: string;
	}

	let tasks = $state<Task[]>([
		{ id: '1', title: 'Design review' },
		{ id: '2', title: 'Code review' },
		{ id: '3', title: 'Deploy to prod' }
	]);

	function handleDrop(state: DragDropState<Task>) {
		const { draggedItem, targetContainer, dropPosition } = state;
		const dragIndex = tasks.findIndex((t) => t.id === draggedItem.id);
		let dropIndex = parseInt(targetContainer ?? '0');
		if (dropPosition === 'after') dropIndex++;

		if (dragIndex !== -1) {
			const [task] = tasks.splice(dragIndex, 1);
			const adjusted = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
			tasks.splice(adjusted, 0, task);
		}
	}
</script>

<div class="task-list">
	{#each tasks as task, index (task.id)}
		<div
			use:draggable={{ container: index.toString(), dragData: task }}
			use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
			class="task-item"
		>
			{task.title}
		</div>
	{/each}
</div>
```

### Multiple Containers (Kanban Board)

```svelte
<script lang="ts">
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';

	interface Card {
		id: string;
		title: string;
		status: 'todo' | 'in-progress' | 'done';
	}

	let cards = $state<Card[]>([
		{ id: '1', title: 'Task A', status: 'todo' },
		{ id: '2', title: 'Task B', status: 'in-progress' },
		{ id: '3', title: 'Task C', status: 'done' }
	]);

	const columns = ['todo', 'in-progress', 'done'] as const;

	function handleDrop(state: DragDropState<Card>) {
		const { draggedItem, targetContainer } = state;
		if (!targetContainer) return;

		cards = cards.map((c) =>
			c.id === draggedItem.id ? { ...c, status: targetContainer as Card['status'] } : c
		);
	}
</script>

<div class="board">
	{#each columns as column}
		<div use:droppable={{ container: column, callbacks: { onDrop: handleDrop } }} class="column">
			<h3>{column}</h3>
			{#each cards.filter((c) => c.status === column) as card (card.id)}
				<div use:draggable={{ container: column, dragData: card }} class="card">
					{card.title}
				</div>
			{/each}
		</div>
	{/each}
</div>
```

### Drag Handles

Use the `handle` option to restrict dragging to a specific element:

```svelte
<div
	use:draggable={{
		container: 'items',
		dragData: item,
		handle: '.drag-handle' // Only the grip icon starts dragging
	}}
>
	<span class="drag-handle">⋮⋮</span>
	<span>{item.name}</span>
	<!-- Text remains selectable, buttons remain clickable -->
</div>
```

### Custom CSS Classes

Override default styling with custom classes:

```svelte
<div
	use:draggable={{
		container: 'list',
		dragData: item,
		attributes: { draggingClass: 'my-dragging opacity-50' }
	}}
	use:droppable={{
		container: 'list',
		callbacks: { onDrop: handleDrop },
		attributes: { dragOverClass: 'my-dropzone bg-blue-100' }
	}}
>
	{item}
</div>
```

### Grid Layout

For grid layouts, the library uses nearest-edge detection:

```svelte
<div class="grid grid-cols-3 gap-4">
	{#each items as item, index (item.id)}
		<div
			use:draggable={{ container: index.toString(), dragData: item }}
			use:droppable={{
				container: index.toString(),
				direction: 'grid',
				callbacks: { onDrop: handleDrop }
			}}
		>
			{item.name}
		</div>
	{/each}
</div>
```

### Horizontal Lists

```svelte
<div class="flex gap-4">
	{#each items as item, index (item.id)}
		<div
			use:draggable={{ container: index.toString(), dragData: item }}
			use:droppable={{
				container: index.toString(),
				direction: 'horizontal',
				callbacks: { onDrop: handleDrop }
			}}
		>
			{item}
		</div>
	{/each}
</div>
```

### Conditional Dropping

Control which items can be dropped where:

```svelte
<script lang="ts">
	function handleDragOver(state: DragDropState<Item>) {
		// Mark invalid drops
		dndState.invalidDrop = !isValidDrop(state.draggedItem, state.targetContainer);
	}

	function handleDrop(state: DragDropState<Item>) {
		if (dndState.invalidDrop) return;
		// Process the drop
	}
</script>

<div
	use:droppable={{
		container: 'filtered',
		callbacks: {
			onDragOver: handleDragOver,
			onDrop: handleDrop
		}
	}}
>
	<!-- Items -->
</div>
```

### Async Drop Handlers

Drop callbacks support async operations:

```svelte
<div
	use:droppable={{
		container: 'list',
		callbacks: {
			onDrop: async (state) => {
				await saveToDatabase(state.draggedItem);
				await refreshData();
			}
		}
	}}
>
	<!-- Items -->
</div>
```

## Default CSS Classes

The library provides these default classes (all customizable):

```css
/* Applied while dragging */
.dragging {
	opacity: 0.5;
}

/* Applied when dragged over */
.drag-over {
	outline: 2px dashed #4caf50;
}

/* Drop position indicators */
.drop-before::before,      /* Line above element */
.drop-after::after,        /* Line below element */
.drop-left::before,        /* Line to left (horizontal) */
.drop-right::after {
	/* Line to right (horizontal) */
	content: '';
	position: absolute;
	background-color: #3b82f6;
	pointer-events: none;
}
```

## More Examples

Explore the demo pages for complete working examples:

- **[Kanban Board](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/+page.svelte)** — Full-featured board with multiple columns
- **[Simple Sortable List](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/simple-list/+page.svelte)** — Basic reordering
- **[Grid Sort](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/grid-sort/+page.svelte)** — 2D grid reordering
- **[Horizontal Scroll](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/horizontal-scroll/+page.svelte)** — Horizontal lists
- **[Nested Containers](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/nested/+page.svelte)** — Hierarchical drag and drop
- **[Drag Handles](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/drag-handle/+page.svelte)** — Handle-based dragging
- **[Custom Classes](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/custom-classes/+page.svelte)** — Custom styling
- **[Interactive Elements](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/interactive-elements/+page.svelte)** — Forms inside draggable items
- **[Conditional Check](https://github.com/thisuxhq/SvelteDnD/blob/main/src/routes/conditional-check/+page.svelte)** — Validation before drop

## Using with Components (Svelte 5.29+)

Svelte actions (`use:draggable`, `use:droppable`) only work on native HTML elements, not components. If you need to use drag and drop on a component, Svelte 5.29+ provides `fromAction` to convert actions into attachments that pass through component props:

```svelte
<script lang="ts">
	import { fromAction } from 'svelte/attachments';
	import { draggable, droppable } from '@thisux/sveltednd';
</script>

<!-- Works on components that spread props onto their root element -->
<Card {@attach fromAction(draggable, { container: 'list', dragData: item })}>
	{item.title}
</Card>

<Column {@attach fromAction(droppable, { container: 'todo', callbacks: { onDrop: handleDrop } })}>
	<!-- draggable items -->
</Column>
```

The component just needs to spread its props onto a root element:

```svelte
<!-- Card.svelte -->
<script>
	let { children, ...props } = $props();
</script>

<div {...props}>
	{@render children?.()}
</div>
```

> **Note:** Requires Svelte 5.29 or newer. On older versions, wrap the component in a `<div>` with the action instead.

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome for Android

## Requirements

- Svelte 5.0 or higher
- TypeScript 5.0 or higher (optional but recommended)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License — see [LICENSE](./LICENSE) for details.

## Acknowledgment

Created by [Sanju](https://sanju.sh), founder of [ThisUX Private Limited](https://thisux.com) — a design-led product studio. If you need help building your next product, [let's talk](https://cal.com/imsanju/15min).
