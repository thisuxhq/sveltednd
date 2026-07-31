---
name: sveltednd
description: >-
  Build drag and drop UIs in Svelte 5 with @thisux/sveltednd. Use when adding
  sortable lists, kanban boards, nested drop zones, drag handles, touch or mobile
  drag, {@attach} draggables, keyboard reordering, drop indicators, or conditional
  drops in Svelte. Covers draggable/droppable actions, attachDraggable and
  attachDroppable, dndState, callbacks, and common reorder patterns.
license: MIT
metadata:
  author: thisux
  package: '@thisux/sveltednd'
  homepage: https://sveltednd.thisux.com
  npm: https://www.npmjs.com/package/@thisux/sveltednd
---

# @thisux/sveltednd

Lightweight drag and drop for **Svelte 5**. TypeScript-first, dual input (HTML5 + pointer/touch), optional keyboard reordering, and first-class `{@attach}` factories.

## When to use

- Sortable lists, kanban columns, grid rearrange, nested containers
- Touch/mobile drag, drag handles, interactive children inside cards
- Component-level DnD via `{@attach attachDraggable(...)}` (Svelte 5.29+)
- Opt-in keyboard grab / arrow move / drop

## When not to use

- Non-Svelte apps
- You only need native HTML5 DnD without a library
- File upload dropzones (this library is for item reordering / moving data)

## Install

```bash
bun add @thisux/sveltednd
# or
npm i @thisux/sveltednd
```

Peer dependency: `svelte` `^5.0.0`. For attachments: Svelte **5.29+**.

Importing the package loads base CSS (side effect). You do not need a separate CSS import in app code unless you are working inside this monorepo's demos.

```ts
import {
	draggable,
	droppable,
	attachDraggable,
	attachDroppable,
	dndState,
	type DragDropState
} from '@thisux/sveltednd';
```

## Mental model

1. **`container`** — string id for a list/column/zone. Source and target are compared by this id.
2. **`dragData`** — typed payload (`T`) carried through the drag. Prefer stable objects with an `id`.
3. **You own the data** — the library does not mutate arrays. Implement moves in `onDrop` using `DragDropState`.
4. **`dndState`** — global reactive snapshot (`isDragging`, `draggedItem`, containers, `dropPosition`, `invalidDrop`).

### `DragDropState<T>` (what `onDrop` receives)

| Field             | Meaning                                                    |
| ----------------- | ---------------------------------------------------------- |
| `draggedItem`     | Payload from the draggable                                 |
| `sourceContainer` | Where the drag started                                     |
| `targetContainer` | Drop zone id (or `null`)                                   |
| `dropPosition`    | `'before' \| 'after' \| null` relative to the hovered item |
| `invalidDrop`     | App set this to reject the drop (conditional validation)   |
| `dragInput`       | `'html5' \| 'pointer' \| 'keyboard'` when active           |

## Quick start: sortable list

Index-as-container is the simplest reorder pattern (each row is both draggable and droppable).

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
		{ id: '3', title: 'Deploy' }
	]);

	function handleDrop(state: DragDropState<Task>) {
		const { draggedItem, targetContainer, dropPosition } = state;
		const dragIndex = tasks.findIndex((t) => t.id === draggedItem.id);
		let dropIndex = parseInt(targetContainer ?? '0', 10);
		if (dropPosition === 'after') dropIndex += 1;

		if (dragIndex === -1 || Number.isNaN(dropIndex)) return;

		const next = [...tasks];
		const [item] = next.splice(dragIndex, 1);
		const adjusted = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
		next.splice(adjusted, 0, item);
		tasks = next;
	}
</script>

{#each tasks as task, index (task.id)}
	<div
		use:draggable={{ container: index.toString(), dragData: task }}
		use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
	>
		{task.title}
	</div>
{/each}
```

**Index math gotcha:** after `splice` remove, if the item was above the insert point, subtract 1 from `dropIndex`. Always key `{#each}` by stable `id`, not array index.

## Actions vs attachments

| API                                   | Use when                                                            |
| ------------------------------------- | ------------------------------------------------------------------- |
| `use:draggable` / `use:droppable`     | Plain HTML elements in the current component                        |
| `attachDraggable` / `attachDroppable` | Svelte components that **spread props onto a root element** (5.29+) |

Prefer a **getter** with attachments so options stay fresh when reactive data changes:

```svelte
<Card
	{@attach attachDraggable(() => ({
		container: columnId,
		dragData: task
	}))}
>
	{task.title}
</Card>

<Column
	{@attach attachDroppable(() => ({
		container: columnId,
		callbacks: { onDrop: handleDrop }
	}))}
>
	<!-- cards -->
</Column>
```

The component root must forward props, e.g. `<div {...props}>{@render children?.()}</div>`.

## Core options (short)

**Draggable:** `container`, `dragData`, `disabled`, `handle` (CSS selector), `interactive` (extra no-drag selectors), `keyboard` (`true` or options object), `callbacks`, `attributes.draggingClass`, `autoScroll`.

**Droppable:** `container`, `disabled`, `direction` (`'vertical' | 'horizontal' | 'grid'`), `callbacks`, `attributes.dragOverClass`, `autoScroll`.

Default protected interactive elements (no drag start): `input`, `textarea`, `select`, `button`, `[contenteditable]`, `a[href]`, `label`, `option`.

Default classes: `dragging`, `drag-over` (overridable).

## Common recipes

### Kanban / multiple containers

Column id = `container`. On drop, update the item's column field from `targetContainer`. See [references/patterns.md](references/patterns.md).

### Drag handle

```svelte
use:draggable={{
	container: 'list',
	dragData: item,
	handle: '.drag-handle'
}}
```

### Conditional drop

In `onDragOver`, set `dndState.invalidDrop = true` to reject; check it again in `onDrop` and clear on `onDragEnd`. See [references/patterns.md](references/patterns.md).

### Keyboard (opt-in)

```svelte
use:draggable={{
	container: index.toString(),
	dragData: item,
	keyboard: true
}}
```

- **Tab** focus item → **Space/Enter** grab → **arrows** move preview → **Space/Enter** drop → **Escape** cancel
- Same `onDrop` as pointer/mouse
- Details: [references/accessibility.md](references/accessibility.md)

### Layout direction

```svelte
use:droppable={{ container: 'gallery', direction: 'horizontal', callbacks: { onDrop } }}
use:droppable={{ container: index.toString(), direction: 'grid', callbacks: { onDrop } }}
```

## Agent checklist

When implementing DnD for the user:

1. Install `@thisux/sveltednd` and import from the package root.
2. Prefer `$state` arrays/objects; mutate via reassignment for Svelte 5 reactivity.
3. Give every item a stable `id`; use it in `{#each ... (id)}` and in `findIndex`.
4. Implement `onDrop` only; do not expect the library to reorder data.
5. For lists, use the index-container + `dropPosition` recipe above unless columns are better.
6. For components, use attachments + prop spreading, with getter options.
7. Add `keyboard: true` when accessibility is requested.
8. Use `handle` when cards contain buttons/inputs.
9. Read deeper docs only as needed:
   - [references/api.md](references/api.md) — full option tables and `dndState`
   - [references/patterns.md](references/patterns.md) — kanban, nested, conditional, grid
   - [references/attachments.md](references/attachments.md) — `{@attach}` details
   - [references/accessibility.md](references/accessibility.md) — keyboard + announcements

## Verify

- Item drags on desktop and updates order/column on drop
- Touch drag does not scroll the page away (`touch-action` handled by library styles)
- Buttons/inputs inside cards still click when `handle` or defaults apply
- With `keyboard: true`, Space/arrows/Escape work and `onDrop` still runs
- No reliance on deleted APIs; public exports are only what `index` re-exports

## Links

- npm: https://www.npmjs.com/package/@thisux/sveltednd
- Demos: https://sveltednd.thisux.com
- Source: https://github.com/thisuxhq/sveltednd
