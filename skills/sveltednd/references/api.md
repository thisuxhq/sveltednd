# API reference

Package: `@thisux/sveltednd` (Svelte 5 peer).

## Exports

```ts
import {
	// Actions (use:draggable / use:droppable)
	draggable,
	droppable,
	// Attachments (Svelte 5.29+ {@attach})
	attachDraggable,
	attachDroppable,
	// Global reactive state
	dndState,
	resetDndState,
	// Types
	type DragDropState,
	type DragDropOptions,
	type DraggableOptions,
	type DragDropCallbacks,
	type DragDropAttributes,
	type KeyboardOptions,
	type KeyboardAnnouncementContext,
	type DragInputMode
} from '@thisux/sveltednd';
```

Importing the package applies base styles (`dnd.css`) via side effect.

## `DragDropState<T>`

| Field             | Type                          | Notes                                |
| ----------------- | ----------------------------- | ------------------------------------ |
| `isDragging`      | `boolean`                     | Active drag session                  |
| `draggedItem`     | `T`                           | Payload from draggable               |
| `sourceContainer` | `string`                      | Origin container id                  |
| `targetContainer` | `string \| null`              | Hovered/drop container               |
| `targetElement`   | `HTMLElement \| null`         | Element under pointer                |
| `dropPosition`    | `'before' \| 'after' \| null` | Relative insert side                 |
| `invalidDrop`     | `boolean?`                    | App-controlled reject flag           |
| `dragInput`       | `DragInputMode \| null`       | `'html5' \| 'pointer' \| 'keyboard'` |

## Callbacks (`DragDropCallbacks<T>`)

Typical order: `onDragStart` → `onDragEnter` / `onDragOver` → `onDrop` → `onDragEnd` (and `onDragLeave` when leaving zones).

| Callback      | When                                            |
| ------------- | ----------------------------------------------- |
| `onDragStart` | Drag begins                                     |
| `onDragEnter` | Enter a drop zone                               |
| `onDragOver`  | Moving over a zone (high frequency; keep light) |
| `onDragLeave` | Leave a drop zone                               |
| `onDrop`      | Drop committed (`async` allowed)                |
| `onDragEnd`   | Always after session ends; cleanup              |

```ts
onDrop?: (state: DragDropState<T>) => Promise<void> | void;
```

## Shared options (`DragDropOptions<T>`)

| Option       | Type                                   | Default / notes                                     |
| ------------ | -------------------------------------- | --------------------------------------------------- |
| `container`  | `string`                               | **Required** zone/list id                           |
| `dragData`   | `T`                                    | Required on draggables; optional on pure drop zones |
| `disabled`   | `boolean`                              | Turns off interaction                               |
| `autoScroll` | `boolean`                              | Auto-scroll near edges (default on)                 |
| `callbacks`  | `DragDropCallbacks<T>`                 | Lifecycle hooks                                     |
| `attributes` | `DragDropAttributes`                   | Class overrides                                     |
| `direction`  | `'vertical' \| 'horizontal' \| 'grid'` | Drop indicator axis (default `'vertical'`)          |

### `DragDropAttributes`

| Field           | Default       | Purpose                                                   |
| --------------- | ------------- | --------------------------------------------------------- |
| `draggingClass` | `'dragging'`  | On source while dragging (space-separated multi-class ok) |
| `dragOverClass` | `'drag-over'` | On zone while hovered                                     |

## `DraggableOptions<T>`

Extends shared options plus:

| Option        | Type                         | Notes                                          |
| ------------- | ---------------------------- | ---------------------------------------------- |
| `interactive` | `string[]`                   | Extra CSS selectors that must not start a drag |
| `handle`      | `string`                     | CSS selector; only this subtree starts drag    |
| `keyboard`    | `boolean \| KeyboardOptions` | Opt-in a11y; default off                       |

Built-in interactive exclusions: `input`, `textarea`, `select`, `button`, `[contenteditable]`, `a[href]`, `label`, `option`.

### `KeyboardOptions`

| Field           | Notes                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| `enabled`       | Default true when object/`true` passed                                     |
| `navigation`    | `'list'` (default); `'containers'` reserved                                |
| `announcements` | Optional formatters: `grabbed`, `moved`, `dropped`, `cancelled`, `invalid` |

Each announcement receives `KeyboardAnnouncementContext`: `itemLabel`, `sourceContainer`, `targetContainer`, `position`, `total`.

## Actions

```ts
draggable<T>(node: HTMLElement, options: DraggableOptions<T>)
droppable<T>(node: HTMLElement, options: DragDropOptions<T>)
```

Svelte action contract: returns `{ update, destroy }`. Options can change via `update` when the `use:` expression updates.

## Attachments

```ts
attachDraggable<T>(options: DraggableOptions<T> | (() => DraggableOptions<T>))
attachDroppable<T>(options: DragDropOptions<T> | (() => DragDropOptions<T>))
```

Prefer getters when `dragData` or `container` is reactive. See [attachments.md](attachments.md).

## Global state

```ts
dndState; // reactive DragDropState
resetDndState(); // clear session (rare; library normally resets)
```

Use `dndState` for overlays, invalid styling, or cross-component UI. For conditional drops, set `dndState.invalidDrop` in `onDragOver` and honor it in `onDrop`.

## CSS hooks (library defaults)

| Class / concept         | Role                                              |
| ----------------------- | ------------------------------------------------- |
| `.svelte-dnd-draggable` | Base touch/select behavior on draggables          |
| `.dragging`             | Active drag source (override via `draggingClass`) |
| `.drag-over`            | Active drop target (override via `dragOverClass`) |
| Drop indicator lines    | Injected for before/after; direction-aware        |

Optional demo helper: `svelte-dnd-touch-feedback` (used on demo pages for touch affordance).

## Direction behavior

| `direction`          | Indicator                   |
| -------------------- | --------------------------- |
| `vertical` (default) | Horizontal line above/below |
| `horizontal`         | Vertical line left/right    |
| `grid`               | Nearest-edge side detection |

## Nested zones

Deepest matching droppable handles the drop. Register both parent and child carefully; prefer distinct `container` ids and validate `targetContainer` in `onDrop`.
