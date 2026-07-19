/**
 * Attachment factories for Svelte 5.29+ `{@attach ...}` syntax.
 *
 * These wrap the existing actions with `fromAction` so they work on
 * components that spread props to a root element, while preserving
 * generics and reactive option updates.
 *
 * @module attachments
 */

export { attachDraggable } from './draggable.js';
export { attachDroppable } from './droppable.js';
