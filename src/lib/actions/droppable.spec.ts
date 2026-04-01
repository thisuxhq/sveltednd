import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { droppable } from './droppable.js';
import { dndState } from '../stores/dnd.svelte.js';

describe('droppable', () => {
	let node: HTMLElement;

	beforeEach(() => {
		// Reset dndState
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
		dndState.targetElement = null;
		dndState.invalidDrop = false;
		node = document.createElement('div');
		document.body.appendChild(node);
	});

	afterEach(() => {
		node.remove();
	});

	describe('Issue #22/#23 - drag-over class persistence', () => {
		it('should add drag-over class on dragenter', () => {
			const action = droppable(node, {
				container: 'test',
				attributes: { dragOverClass: 'drag-over' }
			});

			const dragEnterEvent = new DragEvent('dragenter', {
				bubbles: true,
				cancelable: true
			});
			node.dispatchEvent(dragEnterEvent);

			expect(node.classList.contains('drag-over')).toBe(true);
			action.destroy();
		});

		it('should remove drag-over class on dragleave when counter reaches 0', () => {
			const action = droppable(node, {
				container: 'test',
				attributes: { dragOverClass: 'drag-over' }
			});

			// Enter
			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(true);

			// Leave
			node.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(false);

			action.destroy();
		});

		it('should reset dragEnterCounter to 0 if it goes negative (fix for #22)', () => {
			const action = droppable(node, {
				container: 'test',
				attributes: { dragOverClass: 'drag-over' }
			});

			// Simulate rapid enter/leave that could cause negative counter
			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			node.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
			node.dispatchEvent(new DragEvent('dragleave', { bubbles: true })); // Extra leave

			// Class should be removed despite extra leave
			expect(node.classList.contains('drag-over')).toBe(false);

			// A new enter after the negative counter should still work
			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(true);

			action.destroy();
		});

		it('should keep drag-over class when nested elements trigger dragleave', () => {
			const child = document.createElement('span');
			child.textContent = 'Child';
			node.appendChild(child);

			const action = droppable(node, {
				container: 'test',
				attributes: { dragOverClass: 'drag-over' }
			});

			// Enter parent
			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(true);

			// Enter child (increases counter)
			child.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(true);

			// Leave child (decreases counter but stays > 0)
			child.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(true);

			action.destroy();
		});

		it('should remove drag-over class when drag ends without a drop (dragend)', () => {
			// When drag is cancelled (Escape, dropped outside, etc.) the browser
			// may not fire dragleave. The global dragend listener must clean up.
			const action = droppable(node, {
				container: 'test',
				attributes: { dragOverClass: 'drag-over' }
			});

			// Enter the zone
			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(true);

			// Drag ends globally (e.g. dropped outside or Escape pressed)
			document.dispatchEvent(new DragEvent('dragend', { bubbles: false }));
			expect(node.classList.contains('drag-over')).toBe(false);

			action.destroy();
		});

		it('should remove drag-over class on drop', async () => {
			const onDrop = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDrop },
				attributes: { dragOverClass: 'drag-over' }
			});

			// Enter and drop
			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			expect(node.classList.contains('drag-over')).toBe(true);

			const dropEvent = new DragEvent('drop', {
				bubbles: true,
				cancelable: true,
				dataTransfer: new DataTransfer()
			});
			node.dispatchEvent(dropEvent);

			expect(node.classList.contains('drag-over')).toBe(false);
			action.destroy();
		});
	});

	describe('direction: grid — nearest-edge indicator', () => {
		function makeDragOverEvent(clientX: number, clientY: number) {
			const event = new DragEvent('dragover', { bubbles: true, cancelable: true });
			Object.defineProperty(event, 'clientX', { value: clientX });
			Object.defineProperty(event, 'clientY', { value: clientY });
			return event;
		}

		beforeEach(() => {
			// Give the node a known bounding rect: 0,0 → 100,100
			vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
				left: 0,
				top: 0,
				right: 100,
				bottom: 100,
				width: 100,
				height: 100,
				x: 0,
				y: 0,
				toJSON: () => ({})
			});
		});

		it('should apply drop-left when cursor is on the left third', () => {
			const action = droppable(node, { container: 'test', direction: 'grid' });
			node.dispatchEvent(makeDragOverEvent(10, 50)); // left side
			expect(node.classList.contains('drop-left')).toBe(true);
			action.destroy();
		});

		it('should apply drop-right when cursor is on the right third', () => {
			const action = droppable(node, { container: 'test', direction: 'grid' });
			node.dispatchEvent(makeDragOverEvent(90, 50)); // right side
			expect(node.classList.contains('drop-right')).toBe(true);
			action.destroy();
		});

		it('should apply drop-before when cursor is near the top', () => {
			const action = droppable(node, { container: 'test', direction: 'grid' });
			node.dispatchEvent(makeDragOverEvent(50, 10)); // top area
			expect(node.classList.contains('drop-before')).toBe(true);
			action.destroy();
		});

		it('should apply drop-after when cursor is near the bottom', () => {
			const action = droppable(node, { container: 'test', direction: 'grid' });
			node.dispatchEvent(makeDragOverEvent(50, 90)); // bottom area
			expect(node.classList.contains('drop-after')).toBe(true);
			action.destroy();
		});

		it('should set dropPosition to before for left/top edges', () => {
			const action = droppable(node, { container: 'test', direction: 'grid' });
			node.dispatchEvent(makeDragOverEvent(10, 50));
			expect(dndState.dropPosition).toBe('before');
			action.destroy();
		});

		it('should set dropPosition to after for right/bottom edges', () => {
			const action = droppable(node, { container: 'test', direction: 'grid' });
			node.dispatchEvent(makeDragOverEvent(90, 50));
			expect(dndState.dropPosition).toBe('after');
			action.destroy();
		});

		it('should clear indicator class on dragleave', () => {
			const action = droppable(node, { container: 'test', direction: 'grid' });
			node.dispatchEvent(makeDragOverEvent(10, 50));
			expect(node.classList.contains('drop-left')).toBe(true);
			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			node.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
			expect(node.classList.contains('drop-left')).toBe(false);
			action.destroy();
		});
	});

	describe('Issue #16 - onDrop called for pointer events', () => {
		it('should call onDrop when pointerdrop-on-container event fires', async () => {
			const onDrop = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDrop }
			});

			// Simulate being in drag state
			dndState.isDragging = true;
			dndState.targetContainer = 'test';
			dndState.draggedItem = { id: '1' };

			// Dispatch the custom event that draggable fires
			const customEvent = new CustomEvent('pointerdrop-on-container', {
				bubbles: true,
				detail: { dragData: { id: '1', name: 'Test' } }
			});
			node.dispatchEvent(customEvent);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(onDrop).toHaveBeenCalledTimes(1);
			action.destroy();
		});

		it('should not call onDrop if targetContainer does not match', async () => {
			const onDrop = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDrop }
			});

			// Simulate being in drag state but different target
			dndState.isDragging = true;
			dndState.targetContainer = 'different-container';

			// Dispatch the custom event
			const customEvent = new CustomEvent('pointerdrop-on-container', {
				bubbles: true,
				detail: { dragData: { id: '1' } }
			});
			node.dispatchEvent(customEvent);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(onDrop).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should update dndState.draggedItem from event detail', async () => {
			const onDrop = vi.fn();
			const dragData = { id: '123', name: 'Test Item' };

			const action = droppable(node, {
				container: 'test',
				callbacks: { onDrop }
			});

			dndState.isDragging = true;
			dndState.targetContainer = 'test';

			const customEvent = new CustomEvent('pointerdrop-on-container', {
				bubbles: true,
				detail: { dragData }
			});
			node.dispatchEvent(customEvent);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(dndState.draggedItem).toEqual(dragData);
			action.destroy();
		});

		it('should handle async onDrop with error catching', async () => {
			const error = new Error('Test error');
			const onDrop = vi.fn().mockRejectedValue(error);
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const action = droppable(node, {
				container: 'test',
				callbacks: { onDrop }
			});

			dndState.isDragging = true;
			dndState.targetContainer = 'test';

			const customEvent = new CustomEvent('pointerdrop-on-container', {
				bubbles: true,
				detail: { dragData: { id: '1' } }
			});
			node.dispatchEvent(customEvent);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(consoleSpy).toHaveBeenCalledWith('Drop handling failed:', error);

			consoleSpy.mockRestore();
			action.destroy();
		});
	});

	describe('HTML5 Drag and Drop API', () => {
		it('should call onDrop on drop event', async () => {
			const onDrop = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDrop }
			});

			const dropEvent = new DragEvent('drop', {
				bubbles: true,
				cancelable: true
			});
			node.dispatchEvent(dropEvent);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(onDrop).toHaveBeenCalled();
			action.destroy();
		});

		it('should parse drag data from dataTransfer', async () => {
			const onDrop = vi.fn();
			const dragData = { id: '1', name: 'Test' };

			const action = droppable(node, {
				container: 'test',
				callbacks: { onDrop }
			});

			// Create a mock dataTransfer since happy-dom's DataTransfer is limited
			const mockDataTransfer = {
				getData: vi.fn().mockReturnValue(JSON.stringify(dragData)),
				setData: vi.fn(),
				dropEffect: 'move',
				effectAllowed: 'move'
			};

			const dropEvent = new DragEvent('drop', {
				bubbles: true,
				cancelable: true
			});
			// Override the dataTransfer property
			Object.defineProperty(dropEvent, 'dataTransfer', {
				value: mockDataTransfer,
				enumerable: true
			});

			node.dispatchEvent(dropEvent);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(dndState.draggedItem).toEqual(dragData);
			expect(mockDataTransfer.getData).toHaveBeenCalledWith('text/plain');
			action.destroy();
		});

		it('should call onDragEnter callback', () => {
			const onDragEnter = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDragEnter }
			});

			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));

			expect(onDragEnter).toHaveBeenCalled();
			action.destroy();
		});

		it('should call onDragLeave callback', () => {
			const onDragLeave = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDragLeave }
			});

			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			node.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));

			expect(onDragLeave).toHaveBeenCalled();
			action.destroy();
		});

		it('should call onDragOver callback', () => {
			const onDragOver = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDragOver }
			});

			node.dispatchEvent(new DragEvent('dragover', { bubbles: true }));

			expect(onDragOver).toHaveBeenCalled();
			action.destroy();
		});
	});

	describe('Pointer events for touch/mouse fallback', () => {
		it('should call onDragEnter on pointerover when dragging', () => {
			const onDragEnter = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDragEnter }
			});

			dndState.isDragging = true;
			node.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));

			expect(onDragEnter).toHaveBeenCalled();
			action.destroy();
		});

		it('should not call onDragEnter on pointerover when not dragging', () => {
			const onDragEnter = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDragEnter }
			});

			dndState.isDragging = false;
			node.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));

			expect(onDragEnter).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should call onDragLeave on pointerout when dragging', () => {
			const onDragLeave = vi.fn();
			const action = droppable(node, {
				container: 'test',
				callbacks: { onDragLeave }
			});

			dndState.isDragging = true;
			dndState.targetContainer = 'test';
			node.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }));

			expect(onDragLeave).toHaveBeenCalled();
			action.destroy();
		});
	});

	describe('General functionality', () => {
		it('should respect disabled option', () => {
			const onDragEnter = vi.fn();
			const action = droppable(node, {
				container: 'test',
				disabled: true,
				callbacks: { onDragEnter }
			});

			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));

			expect(onDragEnter).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should update options on update()', () => {
			const action = droppable(node, { container: 'test', disabled: true });

			action.update({ container: 'test', disabled: false });

			// After update, should respond to events
			const onDragEnter = vi.fn();
			action.update({ container: 'test', disabled: false, callbacks: { onDragEnter } });

			node.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
			expect(onDragEnter).toHaveBeenCalled();

			action.destroy();
		});

		it('should clean up event listeners on destroy', () => {
			const action = droppable(node, { container: 'test' });
			expect(() => action.destroy()).not.toThrow();
		});
	});
});
