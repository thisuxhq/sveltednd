/**
 * Droppable attachment factory for `{@attach ...}` (Svelte 5.29+).
 *
 * Prefer this over `use:droppable` when targeting **components** that spread
 * props onto a root element. On plain HTML elements both APIs work.
 *
 * @module attachments/droppable
 */

import type { Attachment } from 'svelte/attachments';
import { droppable as droppableAction } from '$lib/actions/droppable.js';
import type { DragDropOptions } from '$lib/types/index.js';

/**
 * Creates a droppable [attachment](https://svelte.dev/docs/svelte/@attach).
 *
 * Pass options directly, or a **getter** so each attach evaluation reads fresh
 * options (recommended when callbacks close over state).
 *
 * @typeParam T - Payload type for dropped items
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { attachDroppable, type DragDropState } from '@thisux/sveltednd';
 *   import type { Task } from './types';
 *
 *   function handleDrop(state: DragDropState<Task>) {
 *     // update your lists
 *   }
 * </script>
 *
 * <Column
 *   {@attach attachDroppable<Task>(() => ({
 *     container: 'todo',
 *     callbacks: { onDrop: handleDrop }
 *   }))}
 * >
 *   <!-- cards -->
 * </Column>
 * ```
 */
export function attachDroppable<T = unknown>(
	options: DragDropOptions<T> | (() => DragDropOptions<T>)
): Attachment<HTMLElement> {
	const getOptions: () => DragDropOptions<T> =
		typeof options === 'function' ? (options as () => DragDropOptions<T>) : () => options;

	return (element) => {
		const action = droppableAction(element, getOptions());
		return () => {
			action.destroy?.();
		};
	};
}
