/**
 * @thisux/sveltednd - Lightweight drag and drop for Svelte 5
 *
 * A modern, TypeScript-first drag and drop library built on Svelte 5 runes.
 * Supports both HTML5 drag-and-drop API and custom pointer events for
 * maximum compatibility across desktop and mobile.
 *
 * @example
 * ```svelte
 * <script>
 *   import { draggable, droppable } from '@thisux/sveltednd';
 *
 *   let items = ['Item 1', 'Item 2', 'Item 3'];
 *
 *   function handleDrop(state) {
 *     // Rearrange items based on state.draggedItem and state.dropPosition
 *   }
 * </script>
 *
 * {#each items as item (item)}
 *   <div
 *     use:draggable={{ dragData: item, container: 'my-list' }}
 *     use:droppable={{ container: 'my-list', callbacks: { onDrop: handleDrop } }}
 *   >
 *     {item}
 *   </div>
 * {/each}
 * ```
 *
 * @packageDocumentation
 */

// === Actions ===
// Svelte actions for `use:draggable` / `use:droppable` on HTML elements.
export { draggable, droppable } from './actions/index.js';

// === Attachments (Svelte 5.29+) ===
// Factories for `{@attach attachDraggable(...)}` / `{@attach attachDroppable(...)}`.
// Prefer these when applying DnD to components that spread props to a root element.
export { attachDraggable, attachDroppable } from './attachments/index.js';

// === Store ===
// Global reactive state tracking the current drag operation.
// Access this for real-time drag info in your components.
export { dndState, resetDndState } from './stores/dnd.svelte.js';

// === Types ===
// Full TypeScript type definitions for options, callbacks, and state.
// Re-export everything for convenience.
export type * from './types/index.js';

// === Styles ===
// Core CSS for drag states, drop indicators, and visual feedback.
// This import has side effects - it injects the base styles needed
// for the library to function correctly.
import './styles/dnd.css';
