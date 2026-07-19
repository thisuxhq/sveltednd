/**
 * Draggable attachment factory for `{@attach ...}` (Svelte 5.29+).
 *
 * Prefer this over `use:draggable` when targeting **components** that spread
 * props onto a root element. On plain HTML elements both APIs work.
 *
 * @module attachments/draggable
 */

import type { Attachment } from 'svelte/attachments';
import { draggable as draggableAction } from '$lib/actions/draggable.js';
import type { DraggableOptions } from '$lib/types/index.js';

/**
 * Creates a draggable [attachment](https://svelte.dev/docs/svelte/@attach).
 *
 * Pass options directly, or a **getter** so each attach evaluation reads fresh
 * options (recommended when `dragData` / callbacks change). Svelte re-runs the
 * `{@attach ...}` expression when reactive dependencies change, which remounts
 * the attachment with the latest options.
 *
 * @typeParam T - Payload type for `dragData`
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { attachDraggable } from '@thisux/sveltednd';
 *   import type { Task } from './types';
 *
 *   let task = $state<Task>({ id: '1', title: 'Ship it' });
 * </script>
 *
 * <div {@attach attachDraggable({ container: 'list', dragData: task })}>
 *   {task.title}
 * </div>
 *
 * <Card {@attach attachDraggable(() => ({ container: 'list', dragData: task }))}>
 *   {task.title}
 * </Card>
 * ```
 *
 * @example
 * Explicit generic when inference is not enough:
 * ```svelte
 * <div {@attach attachDraggable<Task>(() => ({ container: 'list', dragData: task }))}>
 * ```
 */
export function attachDraggable<T = unknown>(
	options: DraggableOptions<T> | (() => DraggableOptions<T>)
): Attachment<HTMLElement> {
	const getOptions: () => DraggableOptions<T> =
		typeof options === 'function' ? (options as () => DraggableOptions<T>) : () => options;

	return (element) => {
		const action = draggableAction(element, getOptions());
		return () => {
			action.destroy?.();
		};
	};
}
