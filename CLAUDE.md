# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@thisux/sveltednd` - A lightweight drag and drop library for Svelte 5. Uses TypeScript strict mode, Svelte 5 runes (`$state`), and a dual-API approach (HTML5 Drag-and-Drop + Pointer Events for touch support).

## Commands

```bash
bun run dev                # Dev server
bun run build              # Production build (vite build + svelte-package + publint)
bun run package            # Package library only
bun run check              # Type-check (svelte-check)
bun run lint               # Prettier check + ESLint
bun run format             # Auto-format with Prettier
bun run test               # Run all tests once (vitest --run)
bun run test:unit          # Tests in watch mode
bun run test:unit -- --run src/lib/actions/draggable.spec.ts  # Single test file
```

## Architecture

The library exports three things from `src/lib/index.ts`: two Svelte actions (`draggable`, `droppable`) and one reactive state object (`dndState`).

**How it works:**

1. `draggable` action attaches drag event listeners (both HTML5 and pointer events) to an element
2. When dragging starts, it updates the global `dndState` (Svelte 5 `$state` rune in `src/lib/stores/dnd.svelte.ts`) and dispatches custom events
3. `droppable` action listens for dragenter/dragleave/dragover/drop events and pointer events, updates `dndState.targetContainer`, and fires callbacks
4. Application handles reordering in the `onDrop` callback

**Key source files:**

- `src/lib/actions/draggable.ts` - Drag action with handle support and interactive element blocking
- `src/lib/actions/droppable.ts` - Drop action with nested element counter tracking (dragEnterCounter)
- `src/lib/stores/dnd.svelte.ts` - Global reactive state (~11 lines)
- `src/lib/types/index.ts` - All TypeScript interfaces (`DragDropState<T>`, `DraggableOptions<T>`, etc.)
- `src/lib/styles/dnd.css` - Default CSS classes (`dragging`, `drag-over`)
- `src/routes/` - Demo pages (Kanban, sortable list, grid, nested containers, etc.)

## Code Style

- **Tabs** for indentation, **single quotes**, **no trailing commas**, **100 char** print width
- Always use `.js` extensions in imports (TypeScript NodeNext resolution)
- Use `$lib` alias: `import { x } from '$lib/actions/index.js'`
- Use `import type` for type-only imports
- Svelte actions follow the pattern: setup, event handlers, addEventListener, return `{ update(), destroy() }`
- State uses Svelte 5 `$state` runes, not legacy stores
- Files: kebab-case. Functions: camelCase. Types: PascalCase. Constants: UPPER_SNAKE_CASE
- Test files use `*.spec.ts` pattern, colocated with source
- Use feature branches, never commit to main directly
