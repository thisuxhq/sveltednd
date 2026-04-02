import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { draggable } from './draggable.js';
import { dndState } from '../stores/dnd.svelte.js';

describe('draggable', () => {
	let node: HTMLElement;

	beforeEach(() => {
		// Reset dndState
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
		dndState.targetElement = null;
		node = document.createElement('div');
		document.body.appendChild(node);
	});

	afterEach(() => {
		node.remove();
	});

	describe('Issue #12 - DraggableOptions interface', () => {
		it('should accept DraggableOptions with interactive property', () => {
			const options = {
				container: 'test',
				dragData: { id: '1' },
				interactive: ['button', 'input']
			};

			const action = draggable(node, options);
			expect(action).toHaveProperty('destroy');
			expect(action).toHaveProperty('update');
			action.destroy();
		});

		it('should export DraggableOptions type with correct properties', () => {
			// Type-only test - this will fail at compile time if types are wrong
			const options: import('../types/index.js').DraggableOptions<{ id: string }> = {
				container: 'test',
				dragData: { id: '1' },
				interactive: ['button', 'input'],
				disabled: false,
				callbacks: {
					onDragStart: vi.fn(),
					onDragEnd: vi.fn()
				},
				attributes: {
					draggingClass: 'dragging'
				}
			};

			const action = draggable(node, options);
			action.destroy();
		});
	});

	describe('Issue #21 - Interactive elements not blocked', () => {
		it('should not start drag when clicking on input elements by default', () => {
			const onDragStart = vi.fn();
			const input = document.createElement('input');
			input.type = 'text';
			node.appendChild(input);

			const action = draggable(node, {
				container: 'test',
				callbacks: { onDragStart }
			});

			// Simulate pointer down on the input
			const pointerDownEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true
			});
			input.dispatchEvent(pointerDownEvent);

			expect(onDragStart).not.toHaveBeenCalled();
			expect(dndState.isDragging).toBe(false);

			action.destroy();
		});

		it('should prevent dragstart when pointerdown was on an interactive child (HTML5 path)', () => {
			// dragstart's event.target is always the draggable node, not the clicked
			// element. Without tracking the pointerdown target, interactive children
			// (radio, checkbox, input) would fail to block the HTML5 drag.
			const radio = document.createElement('input');
			radio.type = 'radio';
			node.appendChild(radio);

			const action = draggable(node, { container: 'test' });

			// Press on radio — this populates pointerDownTarget
			radio.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));

			// Simulate HTML5 dragstart (target is the draggable node, not the radio)
			const dragStartEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true });
			const prevented = !node.dispatchEvent(dragStartEvent);

			// The drag should have been prevented
			expect(prevented).toBe(true);
			expect(dndState.isDragging).toBe(false);

			action.destroy();
		});

		it('should not start drag when clicking on checkbox', () => {
			const onDragStart = vi.fn();
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			node.appendChild(checkbox);

			const action = draggable(node, {
				container: 'test',
				callbacks: { onDragStart }
			});

			const pointerDownEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true
			});
			checkbox.dispatchEvent(pointerDownEvent);

			expect(onDragStart).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should not start drag when clicking on button', () => {
			const onDragStart = vi.fn();
			const button = document.createElement('button');
			button.textContent = 'Click me';
			node.appendChild(button);

			const action = draggable(node, {
				container: 'test',
				callbacks: { onDragStart }
			});

			const pointerDownEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true
			});
			button.dispatchEvent(pointerDownEvent);

			expect(onDragStart).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should start drag when clicking on non-interactive area of container', () => {
			const onDragStart = vi.fn();
			const div = document.createElement('div');
			div.textContent = 'Drag handle';
			node.appendChild(div);

			const action = draggable(node, {
				container: 'test',
				callbacks: { onDragStart }
			});

			const pointerDownEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true
			});
			node.dispatchEvent(pointerDownEvent);

			expect(dndState.isDragging).toBe(true);
			action.destroy();
		});

		it('should respect custom interactive selectors', () => {
			const onDragStart = vi.fn();
			const customElement = document.createElement('span');
			customElement.className = 'custom-handle';
			node.appendChild(customElement);

			const action = draggable(node, {
				container: 'test',
				interactive: ['.custom-handle'],
				callbacks: { onDragStart }
			});

			const pointerDownEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true
			});
			customElement.dispatchEvent(pointerDownEvent);

			expect(onDragStart).not.toHaveBeenCalled();
			action.destroy();
		});
	});

	describe('Issue #20 - Dragging by handle', () => {
		it('should only allow drag from handle element when handle is specified', () => {
			const onDragStart = vi.fn();
			const handle = document.createElement('div');
			handle.className = 'drag-handle';
			node.appendChild(handle);

			const content = document.createElement('div');
			content.className = 'content';
			content.textContent = 'Not a handle';
			node.appendChild(content);

			const action = draggable(node, {
				container: 'test',
				handle: '.drag-handle',
				callbacks: { onDragStart }
			});

			// Click on content (not handle) - should not start drag
			const contentEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true
			});
			content.dispatchEvent(contentEvent);

			expect(onDragStart).not.toHaveBeenCalled();
			expect(dndState.isDragging).toBe(false);

			// Click on handle - should start drag
			const handleEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				pointerId: 1
			});
			handle.dispatchEvent(handleEvent);

			expect(onDragStart).toHaveBeenCalled();
			expect(dndState.isDragging).toBe(true);

			action.destroy();
		});

		it('should work with data-handle attribute', () => {
			const handle = document.createElement('div');
			handle.setAttribute('data-handle', 'true');
			node.appendChild(handle);

			const action = draggable(node, {
				container: 'test',
				handle: '[data-handle="true"]'
			});

			// Click on handle
			handle.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					pointerId: 1
				})
			);

			expect(dndState.isDragging).toBe(true);
			action.destroy();
		});

		it('should work without handle option (entire element draggable)', () => {
			const onDragStart = vi.fn();

			const action = draggable(node, {
				container: 'test',
				callbacks: { onDragStart }
			});

			// Click anywhere on node
			node.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					pointerId: 1
				})
			);

			expect(onDragStart).toHaveBeenCalled();
			action.destroy();
		});

		it('should work with nested handle elements', () => {
			const handle = document.createElement('div');
			handle.className = 'grip';
			const gripIcon = document.createElement('span');
			handle.appendChild(gripIcon);
			node.appendChild(handle);

			const action = draggable(node, {
				container: 'test',
				handle: '.grip'
			});

			// Click on child element of handle
			gripIcon.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					pointerId: 1
				})
			);

			expect(dndState.isDragging).toBe(true);
			action.destroy();
		});
	});

	describe('Issue #16 - onDrop not called for pointer events', () => {
		it('should dispatch pointerdrop-on-container event on pointerup', () => {
			const dropHandler = vi.fn();
			node.addEventListener('pointerdrop-on-container', dropHandler);

			const action = draggable(node, {
				container: 'test',
				dragData: 'test-data'
			});

			// Start drag
			const pointerDownEvent = new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				pointerId: 1
			});
			node.dispatchEvent(pointerDownEvent);

			expect(dndState.isDragging).toBe(true);

			// End drag
			const pointerUpEvent = new PointerEvent('pointerup', {
				bubbles: true,
				cancelable: true,
				pointerId: 1
			});
			node.dispatchEvent(pointerUpEvent);

			expect(dropHandler).toHaveBeenCalled();
			expect(dropHandler.mock.calls[0][0].detail).toEqual({ dragData: 'test-data' });

			action.destroy();
		});

		it('should include dragData in the custom event detail', () => {
			const dragData = { id: '123', name: 'Test Item' };
			let receivedDetail: unknown;

			node.addEventListener('pointerdrop-on-container', (e: Event) => {
				receivedDetail = (e as CustomEvent).detail;
			});

			const action = draggable(node, {
				container: 'test',
				dragData
			});

			// Start and end drag
			node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
			node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));

			expect(receivedDetail).toEqual({ dragData });
			action.destroy();
		});
	});

	describe('General functionality', () => {
		it('should reset drag state when pointercancel fires (mobile gesture takeover)', () => {
			const onDragEnd = vi.fn();
			const action = draggable(node, {
				container: 'test',
				attributes: { draggingClass: 'dragging' },
				callbacks: { onDragEnd }
			});

			// Start a drag
			node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
			expect(dndState.isDragging).toBe(true);
			expect(node.classList.contains('dragging')).toBe(true);

			// Browser cancels the gesture (e.g. scroll detected on mobile)
			document.dispatchEvent(new PointerEvent('pointercancel', { bubbles: false, pointerId: 1 }));

			expect(dndState.isDragging).toBe(false);
			expect(dndState.draggedItem).toBeNull();
			expect(dndState.sourceContainer).toBe('');
			expect(node.classList.contains('dragging')).toBe(false);
			expect(onDragEnd).toHaveBeenCalledTimes(1);

			action.destroy();
		});

		it('should set node.draggable based on disabled option', () => {
			const action = draggable(node, { container: 'test', disabled: true });
			expect(node.draggable).toBe(false);

			action.update({ container: 'test', disabled: false });
			expect(node.draggable).toBe(true);

			action.destroy();
		});

		it('should add and remove dragging class', () => {
			const action = draggable(node, {
				container: 'test',
				attributes: { draggingClass: 'my-dragging' }
			});

			// Initially no class
			expect(node.classList.contains('my-dragging')).toBe(false);

			// Start drag
			node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
			expect(node.classList.contains('my-dragging')).toBe(true);

			// End drag
			node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
			expect(node.classList.contains('my-dragging')).toBe(false);

			action.destroy();
		});

		it('should call onDragStart and onDragEnd callbacks', () => {
			const onDragStart = vi.fn();
			const onDragEnd = vi.fn();

			const action = draggable(node, {
				container: 'test',
				callbacks: { onDragStart, onDragEnd }
			});

			node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
			expect(onDragStart).toHaveBeenCalledTimes(1);

			node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
			expect(onDragEnd).toHaveBeenCalledTimes(1);

			action.destroy();
		});

		it('should clean up event listeners on destroy', () => {
			const action = draggable(node, { container: 'test' });

			// Just verify destroy doesn't throw and removes listeners
			expect(() => action.destroy()).not.toThrow();
		});
	});
});
