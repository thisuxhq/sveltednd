export interface DragDropState<T = unknown> {
	isDragging: boolean;
	draggedItem: T;
	sourceContainer: string;
	targetContainer: string | null;
}

export interface DragDropCallbacks<T = unknown> {
	onDragStart?: (state: DragDropState<T>) => void;
	onDragEnter?: (state: DragDropState<T>) => void;
	onDragLeave?: (state: DragDropState<T>) => void;
	onDragOver?: (state: DragDropState<T>) => void;
	onDrop?: (state: DragDropState<T>) => Promise<void> | void;
	onDragEnd?: (state: DragDropState<T>) => void;
}

export interface DragDropAttributes {
	draggingClass?: string;
	dragOverClass?: string;
}

export interface DragDropOptions<T = unknown> {
	dragData?: T;
	container: string;
	disabled?: boolean;
	callbacks?: DragDropCallbacks<T>;
	attributes?: DragDropAttributes;
}
