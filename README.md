# @thisux/sveltednd

A lightweight, flexible drag and drop library for Svelte 5 applications. Built with TypeScript and Svelte's runes system for maximum performance and developer experience.

[![npm version](https://badge.fury.io/js/@thisux%2Fsveltednd.svg)](https://www.npmjs.com/package/@thisux/sveltednd)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Copyright](https://img.shields.io/badge/©-THISUX%20Private%20Limited-111111.svg)](LICENSE)

**Docs & community:** [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md) · [Code of Conduct](CODE_OF_CONDUCT.md)

## Features

- **Svelte 5 Native** — Built on Svelte's `$state` runes for reactive state management
- **Dual-Mode Drag** — HTML5 Drag API for desktop + Pointer Events for touch/mobile support
- **TypeScript-First** — Full type safety with generics support throughout
- **Flexible Layouts** — Vertical, horizontal, and grid layouts with smart drop indicators
- **Drag Handles** — Optional handle selectors for precise drag control
- **Smart Interaction** — Automatically protects interactive elements (inputs, buttons, etc.)
- **Drop Indicators** — Visual feedback showing exactly where items will drop
- **Nested Support** — Works with nested containers and complex hierarchies
- **Attachments** — First-class `{@attach}` factories for components (Svelte 5.29+)
- **Keyboard** — Opt-in Space/arrows/Escape reordering with screen-reader announcements
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
- **[Attachments](https://github.com/thisuxhq/sveltednd/blob/main/src/routes/attach/+page.svelte)** — `{@attach}` on components
- **[Keyboard](https://github.com/thisuxhq/sveltednd/blob/main/src/routes/keyboard/+page.svelte)** — Space / arrows / Escape reordering

## Keyboard accessibility (opt-in)

Enable keyboard reordering with `keyboard: true` on a **draggable**. Mouse and touch
behavior are unchanged when the option is omitted.

| Key                                 | Action                                            |
| ----------------------------------- | ------------------------------------------------- |
| **Tab**                             | Focus a keyboard-enabled item                     |
| **Space** / **Enter**               | Pick up, or drop while dragging                   |
| **↑ / ↓** (or ← / → for horizontal) | Move the drop preview among registered drop zones |
| **Escape**                          | Cancel without calling `onDrop`                   |

```svelte
<script lang="ts">
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';

	let items = $state(['Alpha', 'Beta', 'Gamma']);

	function handleDrop(state: DragDropState<string>) {
		const from = items.indexOf(state.draggedItem);
		let to = parseInt(state.targetContainer ?? '0');
		if (state.dropPosition === 'after') to += 1;
		if (from === -1) return;
		const next = [...items];
		const [item] = next.splice(from, 1);
		next.splice(from < to ? to - 1 : to, 0, item);
		items = next;
	}
</script>

{#each items as item, index (item)}
	<div
		use:draggable={{
			container: index.toString(),
			dragData: item,
			keyboard: true
		}}
		use:droppable={{
			container: index.toString(),
			callbacks: { onDrop: handleDrop }
		}}
	>
		{item}
	</div>
{/each}
```

Notes:

- Keyboard uses the **same** `onDrop` contract as pointer/HTML5 — your data model stays in the app.
- An assertive live region announces grab / move / drop / cancel for screen readers.
- Interactive children (inputs, buttons, …) still receive Space/Enter normally.
- Cross-column Kanban keyboard navigation is planned as a follow-up (`navigation: 'containers'`).

Live demo: [Keyboard](https://sveltednd.thisux.com/keyboard) ·
[source](https://github.com/thisuxhq/sveltednd/blob/main/src/routes/keyboard/+page.svelte)

## Using with Components — `{@attach}` (Svelte 5.29+)

Svelte actions (`use:draggable`, `use:droppable`) only work on **native HTML elements**. For
**components**, use the first-class attachment factories:

| API                                   | Use on                     | Syntax                           |
| ------------------------------------- | -------------------------- | -------------------------------- |
| `draggable` / `droppable`             | HTML elements              | `use:draggable={...}`            |
| `attachDraggable` / `attachDroppable` | Elements **or** components | `{@attach attachDraggable(...)}` |

Pass a **getter** (`() => options`) when options depend on reactive state — that keeps
generics intact and updates the underlying action without remounting.

```svelte
<script lang="ts">
	import { attachDraggable, attachDroppable, type DragDropState } from '@thisux/sveltednd';

	interface Task {
		id: string;
		title: string;
	}

	let task = $state<Task>({ id: '1', title: 'Ship attach API' });

	function handleDrop(state: DragDropState<Task>) {
		// update your data
	}
</script>

<!-- Component roots: works because Card/Column spread {...props} onto an element -->
<Card
	{@attach attachDraggable(() => ({
		container: 'list',
		dragData: task
	}))}
>
	{task.title}
</Card>

<Column
	{@attach attachDroppable<Task>(() => ({
		container: 'todo',
		callbacks: { onDrop: handleDrop }
	}))}
>
	<!-- cards -->
</Column>
```

Your component must forward props (and thus attachments) to a real DOM node:

```svelte
<!-- Card.svelte -->
<script lang="ts">
	let { children, ...props } = $props();
</script>

<div {...props}>
	{@render children?.()}
</div>
```

You can still use `fromAction` from `svelte/attachments` with the raw actions if you prefer,
but always pass a **function** as the second argument:

```svelte
<!-- Correct -->
<div {@attach fromAction(draggable, () => ({ container: 'list', dragData: item }))}></div>

<!-- Incorrect — second arg must be a getter, not the options object -->
<div {@attach fromAction(draggable, { container: 'list', dragData: item })}></div>
```

> **Note:** Attachments require **Svelte 5.29+** (`fromAction` is available in current 5.x).
> On older versions, wrap the component in a `<div>` and use `use:draggable` / `use:droppable`.

Live demo: [Attachments](https://sveltednd.thisux.com/attach) ·
[source](https://github.com/thisuxhq/sveltednd/blob/main/src/routes/attach/+page.svelte)

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

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
coding style, Conventional Commits, and PR guidelines. Please also follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

Security vulnerabilities should be reported privately — see [SECURITY.md](SECURITY.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

Copyright © 2024–2026 [THISUX Private Limited](https://github.com/thisuxhq).

Released under the [MIT License](LICENSE). You may use, modify, and distribute
this project for personal and commercial purposes, provided the copyright and
permission notice are retained.

## Acknowledgment

Created by [Sanju](https://sanju.sh), founder of
[THISUX Private Limited](https://thisux.com) — a design-led product studio. If
you need help building your next product,
[let's talk](https://cal.com/imsanju/15min).
