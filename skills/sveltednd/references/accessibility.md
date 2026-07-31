# Accessibility and keyboard

Keyboard support is **opt-in** so existing apps do not gain unexpected `tabindex` or key listeners.

## Enable

```svelte
use:draggable={{
	container: index.toString(),
	dragData: item,
	keyboard: true
}}
```

Or with attachments:

```svelte
{@attach attachDraggable(() => ({
	container: columnId,
	dragData: item,
	keyboard: true
}))}
```

Object form:

```ts
keyboard: {
	enabled: true,
	navigation: 'list', // default; 'containers' reserved
	announcements: {
		grabbed: (ctx) => `Grabbed ${ctx.itemLabel}`,
		moved: (ctx) => `Position ${ctx.position} of ${ctx.total}`,
		dropped: (ctx) => `Dropped ${ctx.itemLabel}`,
		cancelled: () => 'Reorder cancelled',
		invalid: () => 'Cannot drop here'
	}
}
```

## Keys

| Key                        | Action                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `Tab` / `Shift+Tab`        | Focus draggable items (library manages focusability when enabled) |
| `Space` or `Enter`         | Grab focused item, or drop while moving                           |
| `ArrowUp` / `ArrowDown`    | Move drop preview (vertical lists)                                |
| `ArrowLeft` / `ArrowRight` | Move preview when `direction: 'horizontal'`                       |
| `Escape`                   | Cancel keyboard drag                                              |

Pointer and HTML5 paths keep working on the same elements.

## Data path

Keyboard drop calls the **same** `onDrop` callback as mouse/touch with a normal `DragDropState`. `dndState.dragInput === 'keyboard'` during the session.

Conditional validation still works: set `dndState.invalidDrop` in `onDragOver`; invalid keyboard drops announce and do not commit.

## Screen readers

The library uses an assertive live region for grab / move / drop / cancel / invalid. Override copy via `keyboard.announcements`.

App-level recommendations:

- Prefer semantic structure: `role="list"` / `role="listitem"` (or native lists) when it fits
- Visible focus styles (`:focus-visible`)
- Meaningful item text so default `itemLabel` extraction is useful
- Do not remove focus outlines on draggable rows when keyboard mode is on

## Example shell

```svelte
<div role="list" aria-label="Reorderable tasks">
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
			class="focus-visible:outline ..."
		>
			{item.title}
		</div>
	{/each}
</div>
```

## Limits / honesty

- Keyboard nav is strongest for linear lists (`navigation: 'list'`)
- Multi-column keyboard roaming is limited today; design kanban UX accordingly or supplement with your own focus management
- Color-only drop validity is not enough; pair `invalidDrop` with text/announcement
- Drag handles still apply: ensure the focused control can activate keyboard grab (enable keyboard on the draggable that owns the item)

## Demo

https://sveltednd.thisux.com/keyboard
