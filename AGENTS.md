# AGENTS.md - @thisux/sveltednd

Guidelines for agentic coding agents working in this repository.

## Project Overview

Lightweight drag and drop library for Svelte 5 applications. Built with TypeScript and Svelte's runes system.

- **Framework**: Svelte 5 + SvelteKit
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun (preferred) or npm
- **Styling**: Tailwind CSS

## Build/Lint/Test Commands

```bash
# Development
bun run dev              # Start dev server

# Building
bun run build            # Build library for production (vite build + package)
bun run package          # Create package with svelte-package + publint

# Code Quality
bun run check            # Type-check with svelte-check
bun run check:watch      # Type-check in watch mode
bun run lint             # Run Prettier check + ESLint
bun run format           # Format with Prettier (write)

# Testing
bun run test             # Run all tests once (vitest --run)
bun run test:unit        # Run tests in watch mode
bun run test:unit -- --run src/lib/actions/draggable.spec.ts   # Single test file
```

## Code Style Guidelines

### Formatting (Prettier)
- **Tabs**: Use tabs for indentation (not spaces)
- **Quotes**: Single quotes in JS/TS, double in Svelte templates
- **Trailing commas**: Never
- **Print width**: 100 characters
- Run `bun run format` before committing

### Imports
- Use `$lib` alias for internal imports: `import { x } from '$lib/actions/index.js'`
- Always include `.js` extension in relative imports: `import { x } from './file.js'`
- Use `import type` for type-only imports: `import type { DragDropState } from '$lib/types/index.js'`
- Group: external deps → internal aliases → relative imports

### TypeScript Conventions
- Enable `strict: true` - all strict mode options required
- Use generics with defaults: `interface DragDropState<T = unknown>`
- Prefer `type` over `interface` for complex unions
- Export types explicitly: `export type * from './types/index.js'`
- Use `$state` runes for reactive state (Svelte 5)

### Naming Conventions
- **Files**: kebab-case (e.g., `draggable.ts`, `dnd.svelte.ts`)
- **Functions**: camelCase (e.g., `handleDragStart`, `isInteractiveElement`)
- **Interfaces/Types**: PascalCase (e.g., `DragDropState`, `DraggableOptions`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `DEFAULT_DRAGGING_CLASS`)
- **Generic parameters**: Single uppercase letter (e.g., `T`, `K`, `V`)

### Actions Pattern
Svelte actions follow this structure:
```typescript
export function actionName<T>(node: HTMLElement, options: Options<T>) {
    // Setup logic
    function handleEvent(event: Event) { }
    
    node.addEventListener('event', handleEvent);
    
    return {
        update(newOptions: Options<T>) { options = newOptions; },
        destroy() { node.removeEventListener('event', handleEvent); }
    };
}
```

### Error Handling
- Use optional chaining for callbacks: `options.callbacks?.onDrop?.(state)`
- Wrap async operations in try/catch in droppable handlers
- Log errors with context: `console.error('Drop handling failed:', error)`

### CSS/Styling
- Default classes: `dragging`, `drag-over` (overridable via attributes)
- Use Tailwind for demo/examples
- Import styles in `src/lib/index.ts`: `import './styles/dnd.css'`

## Project Structure

```
src/
├── lib/
│   ├── actions/          # draggable.ts, droppable.ts, index.ts
│   ├── stores/           # dnd.svelte.ts (state runes)
│   ├── types/            # TypeScript interfaces
│   ├── styles/           # dnd.css
│   └── index.ts          # Public API exports
└── routes/               # Demo pages (SvelteKit)
```

## Important Notes

- Always use `.js` extensions in imports (TypeScript NodeNext resolution)
- State management uses Svelte 5 `$state` runes, not stores
- Library exports via `svelte-package` to `dist/`
- Test files: `*.spec.ts` or `*.test.ts` in `src/`
- Never commit to main directly - use feature branches
