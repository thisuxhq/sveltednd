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
3. On desktop, `pointercancel` fires when the browser takes over the pointer for HTML5 drag — an `html5DragActive` flag prevents this from resetting state mid-drag
4. `droppable` action listens for dragenter/dragleave/dragover/drop events (HTML5 path) and a document-level `pointermove` + `getBoundingClientRect` (pointer/touch path), updates `dndState.targetContainer`, and fires callbacks
5. On touch devices, `pointerover`/`pointerout` don't fire on elements beneath the finger, so hover detection uses coordinate-based bounds checking instead
6. Application handles reordering in the `onDrop` callback

**Key source files:**

- `src/lib/actions/draggable.ts` - Drag action with handle support and interactive element blocking
- `src/lib/actions/droppable.ts` - Drop action with nested element counter tracking (dragEnterCounter) and coordinate-based touch hover detection (wasOver + getBoundingClientRect)
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
- All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by Husky + commitlint

## Commit Convention

Format: `type(scope): description`

| Type       | When to use                          |
| ---------- | ------------------------------------ |
| `feat`     | New user-facing feature              |
| `fix`      | Bug fix                              |
| `docs`     | Documentation only                   |
| `chore`    | Tooling, deps, config                |
| `refactor` | Code restructure, no behavior change |
| `test`     | Adding or fixing tests               |
| `ci`       | CI/CD changes                        |
| `style`    | Formatting only                      |

Examples: `feat: add keyboard drag support`, `fix: prevent stuck drag state on mobile`

The `commit-msg` hook will reject commits that don't follow this format.
