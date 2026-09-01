# Patterns

Concrete data patterns for `@thisux/sveltednd`. The library never mutates your arrays; every recipe ends in an `onDrop` that updates `$state`.

## 1. Same-list reorder (index containers)

Each row is both draggable and droppable. `container` is the stringified index.

```ts
function handleDrop(state: DragDropState<Item>) {
	const { draggedItem, targetContainer, dropPosition } = state;
	const dragIndex = items.findIndex((i) => i.id === draggedItem.id);
	let dropIndex = parseInt(targetContainer ?? '0', 10);
	if (dropPosition === 'after') dropIndex += 1;
	if (dragIndex === -1 || Number.isNaN(dropIndex)) return;

	const next = [...items];
	const [item] = next.splice(dragIndex, 1);
	const adjusted = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
	next.splice(adjusted, 0, item);
	items = next;
}
```

```svelte
{#each items as item, index (item.id)}
	<div
		use:draggable={{ container: index.toString(), dragData: item }}
		use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
	>
		{item.title}
	</div>
{/each}
```

Tips:

- Key by `item.id`, not index
- Copy then assign (`items = next`) for Svelte 5 reactivity
- Optional: `animate:flip` for polish

## 2. Kanban / status columns

One droppable per column; cards carry `status` (or column id).

```ts
const columns = ['todo', 'doing', 'done'] as const;

function handleDrop(state: DragDropState<Card>) {
	const { draggedItem, targetContainer } = state;
	if (!targetContainer) return;
	if (!columns.includes(targetContainer as (typeof columns)[number])) return;

	cards = cards.map((c) =>
		c.id === draggedItem.id ? { ...c, status: targetContainer as Card['status'] } : c
	);
}
```

```svelte
{#each columns as column}
	<div use:droppable={{ container: column, callbacks: { onDrop: handleDrop } }}>
		{#each cards.filter((c) => c.status === column) as card (card.id)}
			<div use:draggable={{ container: column, dragData: card }}>
				{card.title}
			</div>
		{/each}
	</div>
{/each}
```

Within-column reorder: combine column id with index containers, or store an `order` field and sort after drop using `dropPosition`.

## 3. Two lists (transfer)

Separate arrays; move item between them based on `sourceContainer` / `targetContainer`.

```ts
function handleDrop(state: DragDropState<Profile>) {
	const { sourceContainer, targetContainer, draggedItem } = state;
	if (!targetContainer || sourceContainer === targetContainer) return;

	if (sourceContainer === 'available' && targetContainer === 'selected') {
		available = available.filter((p) => p.id !== draggedItem.id);
		selected = [...selected, draggedItem];
	} else if (sourceContainer === 'selected' && targetContainer === 'available') {
		selected = selected.filter((p) => p.id !== draggedItem.id);
		available = [...available, draggedItem];
	}
}
```

Zone markup: outer `use:droppable={{ container: 'available' | 'selected', ... }}`, items `use:draggable` with the same container id as their list.

## 4. Drag handle + interactive children

```svelte
<div
	use:draggable={{
		container: index.toString(),
		dragData: item,
		handle: '.drag-handle',
		interactive: ['.menu-btn'] // extra beyond defaults if needed
	}}
	use:droppable={{ container: index.toString(), callbacks: { onDrop: handleDrop } }}
>
	<button type="button" class="drag-handle" aria-label="Drag">⋮⋮</button>
	<span>{item.title}</span>
	<button type="button" class="menu-btn">Menu</button>
</div>
```

Defaults already skip `button`, `input`, links, etc. Use `handle` when the whole card should not be the drag surface.

## 5. Conditional / validated drops

```ts
import { dndState, type DragDropState } from '@thisux/sveltednd';

function validate(state: DragDropState<Fruit>) {
	// Example: only "red" fruits allowed in target
	dndState.invalidDrop = state.draggedItem?.color !== 'red';
}

const callbacks = {
	onDragOver: validate,
	onDrop: async (state: DragDropState<Fruit>) => {
		if (dndState.invalidDrop || !state.draggedItem) return;
		// mutate lists...
	},
	onDragEnd: () => {
		dndState.invalidDrop = false;
	}
};
```

Style invalid targets with your own class bound to `dndState.invalidDrop` while dragging over the zone.

## 6. Horizontal list

```svelte
use:droppable={{
	container: index.toString(),
	direction: 'horizontal',
	callbacks: { onDrop: handleDrop }
}}
```

Same index math as vertical; only indicators change.

## 7. Grid sort

```svelte
use:droppable={{
	container: index.toString(),
	direction: 'grid',
	callbacks: { onDrop: handleDrop }
}}
```

Use the same reorder splice recipe; `dropPosition` still guides before/after relative to the nearest edge.

## 8. Nested containers

- Give every zone a unique `container` string
- In `onDrop`, branch on `targetContainer` (and optionally inspect `targetElement`)
- Deepest zone wins the drop; avoid accidental parent handling by checking ids
- Set matching `containerGroup` on draggables and droppables at the same hierarchy level so `drag-over` / drop indicators only light up compatible zones (e.g. `'group'` vs `'item'`)

```svelte
<!-- Group shell -->
<div
	use:droppable={{
		container: group.id,
		containerGroup: 'group',
		callbacks: { onDrop: handleGroupDrop }
	}}
>
	<div
		use:draggable={{
			container: group.id,
			containerGroup: 'group',
			dragData: { kind: 'group', group }
		}}
	>
		...
	</div>
	<!-- Items -->
	<div
		use:droppable={{
			container: `list:${group.id}`,
			containerGroup: 'item',
			callbacks: { onDrop: handleItemDrop }
		}}
	>
		{#each group.items as item (item.id)}
			<div
				use:droppable={{
					container: `item:${group.id}:${item.id}`,
					containerGroup: 'item',
					callbacks: { onDrop: handleItemDrop }
				}}
			>
				<div
					use:draggable={{
						container: `item:${group.id}:${item.id}`,
						containerGroup: 'item',
						dragData: { kind: 'item', item, groupId: group.id }
					}}
				>
					{item.title}
				</div>
			</div>
		{/each}
	</div>
</div>
```

## 9. Custom classes

```svelte
use:draggable={{
	container: 'list',
	dragData: item,
	attributes: { draggingClass: 'opacity-50 ring-2' }
}}
use:droppable={{
	container: 'list',
	attributes: { dragOverClass: 'bg-blue-50 outline' },
	callbacks: { onDrop }
}}
```

## 10. Overlay / ghost UI from global state

```svelte
<script>
	import { dndState } from '@thisux/sveltednd';
</script>

{#if dndState.isDragging}
	<p class="sr-only">Dragging from {dndState.sourceContainer}</p>
{/if}
```

## Anti-patterns

- Mutating the dragged array in place without reassignment (Svelte 5 may not see it)
- Using array index as `{#each}` key while reordering
- Expecting the library to persist order
- Forgetting to clear `invalidDrop` on `onDragEnd`
- Putting `use:draggable` on a component without prop spreading (use attachments instead)
