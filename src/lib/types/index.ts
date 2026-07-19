/**
 * Core type definitions for @thisux/sveltednd
 *
 * These interfaces define the contract between draggable elements and drop zones.
 * All types are generic over `T` - your data type - so you get full type safety
 * throughout the drag and drop lifecycle.
 *
 * @example
 * ```typescript
 * interface Task {
 *   id: string;
 *   title: string;
 * }
 *
 * const options: DraggableOptions<Task> = {
 *   dragData: task,
 *   container: 'todo-list',
 *   callbacks: {
 *     onDrop: (state) => {
 *       // state.draggedItem is fully typed as Task
 *       console.log(state.draggedItem.title);
 *     }
 *   }
 * };
 * ```
 */

/**
 * Represents the current state of a drag and drop operation.
 *
 * This state is maintained globally (in dndState) and passed to all callbacks
 * so you can react to changes throughout the drag lifecycle.
 *
 * @typeParam T - The type of data being dragged (your item type)
 */
/** Which input path started the current drag session (when active). */
export type DragInputMode = 'html5' | 'pointer' | 'keyboard';

export interface DragDropState<T = unknown> {
	/** True while the user is actively dragging (from dragstart to dragend) */
	isDragging: boolean;
	/** The data payload being dragged - typed as T for full type safety */
	draggedItem: T;
	/** The container identifier where the drag originated */
	sourceContainer: string;
	/**
	 * The container currently being hovered over (null if not over any drop zone).
	 * Updates in real-time as the user moves between containers.
	 */
	targetContainer: string | null;
	/**
	 * The specific DOM element currently under the cursor.
	 * Useful for highlighting the exact drop target.
	 */
	targetElement: HTMLElement | null;
	/**
	 * Where the item would drop relative to the target element:
	 * - 'before' = drop above this item
	 * - 'after' = drop below this item
	 * - null = not over a valid drop position
	 */
	dropPosition: 'before' | 'after' | null;
	/**
	 * Set to true when dragging over an invalid drop zone.
	 * Useful for showing visual feedback (e.g., red highlighting).
	 */
	invalidDrop?: boolean;
	/**
	 * Input modality for the active drag, when dragging.
	 * `null` when idle. Additive — safe for apps that ignore it.
	 */
	dragInput?: DragInputMode | null;
}

/**
 * Callback functions fired at each stage of the drag lifecycle.
 *
 * All callbacks receive the current DragDropState, so you always have
 * access to the dragged item and current drop context.
 *
 * Lifecycle order:
 * 1. onDragStart - User started dragging
 * 2. onDragEnter - Drag entered a drop zone
 * 3. onDragOver - Drag moving within a drop zone (fires continuously)
 * 4. onDrop - Item was dropped (async supported)
 * 5. onDragEnd - Drag ended (successfully or cancelled)
 * 6. onDragLeave - Drag left a drop zone (if applicable)
 *
 * @typeParam T - The type of data being dragged
 */
export interface DragDropCallbacks<T = unknown> {
	/**
	 * Called when dragging begins. Great for visual feedback like
	 * dimming the original item or showing a drag ghost.
	 */
	onDragStart?: (state: DragDropState<T>) => void;
	/**
	 * Called when drag enters a valid drop zone.
	 * Use this to highlight the container (e.g., add a border).
	 */
	onDragEnter?: (state: DragDropState<T>) => void;
	/**
	 * Called when drag leaves a drop zone.
	 * Clean up any highlighting added in onDragEnter.
	 */
	onDragLeave?: (state: DragDropState<T>) => void;
	/**
	 * Called continuously while dragging over a drop zone.
	 * Fires on every mouse/pointer move - keep it lightweight!
	 */
	onDragOver?: (state: DragDropState<T>) => void;
	/**
	 * Called when the user drops the item.
	 * This is where you update your data model and rearrange items.
	 *
	 * Supports async operations - return a Promise and the state
	 * will remain stable until it resolves.
	 */
	onDrop?: (state: DragDropState<T>) => Promise<void> | void;
	/**
	 * Called when the drag ends, regardless of whether it was successful.
	 * Always fires after onDrop (if there was one) - perfect for cleanup.
	 */
	onDragEnd?: (state: DragDropState<T>) => void;
}

/**
 * CSS class customization options.
 *
 * By default, the library uses 'dragging' and 'drag-over' classes,
 * but you can override these to match your design system.
 */
export interface DragDropAttributes {
	/**
	 * CSS class(es) added to the element while being dragged.
	 * Default: 'dragging'
	 *
	 * Supports multiple classes: 'my-dragging opacity-50'
	 */
	draggingClass?: string;
	/**
	 * CSS class(es) added to drop zones while an item is dragged over them.
	 * Default: 'drag-over'
	 *
	 * Supports multiple classes: 'my-dropzone border-blue-500'
	 */
	dragOverClass?: string;
}

/**
 * Base configuration options shared between draggable and droppable.
 *
 * @typeParam T - The type of data being dragged
 */
export interface DragDropOptions<T = unknown> {
	/**
	 * The data payload to attach to this element.
	 * Available in all callbacks via state.draggedItem.
	 */
	dragData?: T;
	/**
	 * A unique identifier for this container/group.
	 * Used to track where items came from and where they can be dropped.
	 *
	 * @example
	 * 'todo-list', 'done-column', 'sidebar-items'
	 */
	container: string;
	/**
	 * When true, disables all drag/drop functionality for this element.
	 * Useful for read-only modes or permission-based UIs.
	 */
	disabled?: boolean;
	/**
	 * Whether to auto-scroll scrollable ancestors when dragging near their edges.
	 * Enabled by default. Set to false to disable for this container.
	 */
	autoScroll?: boolean;
	/** Event callbacks for reacting to drag lifecycle changes */
	callbacks?: DragDropCallbacks<T>;
	/** CSS class customization options */
	attributes?: DragDropAttributes;
	/**
	 * Layout direction of the list.
	 * - 'vertical' (default): items stacked top-to-bottom; drop indicator is a horizontal line
	 * - 'horizontal': items laid out left-to-right; drop indicator is a vertical line
	 * - 'grid': 2D grid layout; nearest-edge detection picks the correct side automatically
	 *
	 * @example
	 * // Horizontal image gallery
	 * use:droppable={{ container: 'gallery', direction: 'horizontal', callbacks: { onDrop } }}
	 * // Grid sort
	 * use:droppable={{ container: index.toString(), direction: 'grid', callbacks: { onDrop } }}
	 */
	direction?: 'vertical' | 'horizontal' | 'grid';
}

/**
 * Context passed to keyboard announcement formatters.
 */
export interface KeyboardAnnouncementContext {
	/** Human-readable label for the item when available */
	itemLabel: string;
	/** Source container id */
	sourceContainer: string;
	/** Current target container id (if any) */
	targetContainer: string | null;
	/** 1-based index among keyboard targets, or null */
	position: number | null;
	/** Total keyboard targets considered */
	total: number | null;
}

/**
 * Opt-in keyboard drag configuration (issue #24).
 *
 * Default is off so existing apps get zero tabindex/listener changes until
 * they enable `keyboard: true` on a draggable.
 */
export interface KeyboardOptions {
	/**
	 * When false, keyboard support is disabled even if the object is present.
	 * @default true when `keyboard` is an object or `true`
	 */
	enabled?: boolean;
	/**
	 * - `'list'` (default): arrows move among registered droppables along the axis
	 * - `'containers'`: reserved for multi-column navigation (future)
	 */
	navigation?: 'list' | 'containers';
	/** Override screen-reader announcements (assertive live region) */
	announcements?: {
		grabbed?: (ctx: KeyboardAnnouncementContext) => string;
		moved?: (ctx: KeyboardAnnouncementContext) => string;
		dropped?: (ctx: KeyboardAnnouncementContext) => string;
		cancelled?: (ctx: KeyboardAnnouncementContext) => string;
		invalid?: (ctx: KeyboardAnnouncementContext) => string;
	};
}

/**
 * Configuration options specifically for draggable elements.
 *
 * Extends the base DragDropOptions with features for controlling
 * what can be dragged and how the drag is initiated.
 *
 * @typeParam T - The type of data being dragged
 */
export interface DraggableOptions<T = unknown> extends DragDropOptions<T> {
	/**
	 * Additional CSS selectors for elements that should remain interactive
	 * even when inside a draggable. Clicks on these elements won't start a drag.
	 *
	 * By default, these are already protected: input, textarea, select,
	 * button, [contenteditable], a[href], label, option
	 *
	 * @example
	 * ['.my-button', '[data-no-drag]']
	 */
	interactive?: string[];
	/**
	 * CSS selector for a drag handle element.
	 * When provided, dragging only starts from this handle, not the
	 * entire element. Great for lists where you want a specific "grip" icon.
	 *
	 * @example
	 * '.drag-handle', '[data-drag-handle]'
	 */
	handle?: string;
	/**
	 * Enable keyboard reordering for this item (Space/Enter grab & drop,
	 * arrows to move, Escape to cancel). Opt-in to avoid changing Tab order
	 * in existing apps. Works with `attachDraggable` as well.
	 *
	 * @example
	 * use:draggable={{ container: '0', dragData: item, keyboard: true }}
	 */
	keyboard?: boolean | KeyboardOptions;
}
