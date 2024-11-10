export interface DragDropState {
	isDragging: boolean;
	draggedItem: any;
	sourceContainer: string;
	targetContainer: string | null;
}

export interface DragDropCallbacks {
	onDragStart?: (state: DragDropState) => void;
	onDragEnter?: (state: DragDropState) => void;
	onDragLeave?: (state: DragDropState) => void;
	onDragOver?: (state: DragDropState) => void;
	onDrop?: (state: DragDropState) => Promise<void> | void;
	onDragEnd?: (state: DragDropState) => void;
}

export interface DragDropOptions {
	dragData?: any;
	container: string;
	disabled?: boolean;
	callbacks?: DragDropCallbacks;
}
