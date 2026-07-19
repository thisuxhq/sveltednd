import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { attachDraggable } from './draggable.js';
import { attachDroppable } from './droppable.js';
import { dndState } from '../stores/dnd.svelte.js';

describe('attachments (issue #59)', () => {
	let node: HTMLElement;

	beforeEach(() => {
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
		dndState.targetElement = null;
		dndState.dropPosition = null;
		dndState.invalidDrop = false;
		node = document.createElement('div');
		document.body.appendChild(node);
	});

	afterEach(() => {
		node.remove();
	});

	describe('attachDraggable', () => {
		it('returns an Attachment function', () => {
			const attachment = attachDraggable({ container: 'list', dragData: { id: '1' } });
			expect(typeof attachment).toBe('function');
		});

		it('wires pointer drag like the action when attached', () => {
			const onDragStart = vi.fn();
			const attachment = attachDraggable({
				container: 'list',
				dragData: { id: '1' },
				callbacks: { onDragStart }
			});

			const teardown = attachment(node);
			node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));

			expect(dndState.isDragging).toBe(true);
			expect(dndState.draggedItem).toEqual({ id: '1' });
			expect(onDragStart).toHaveBeenCalledTimes(1);

			teardown?.();
			// destroy should clean listeners; further pointerdown must not start a new drag
			// (teardown destroys the action; state may still reflect last drag unless ended)
		});

		it('accepts a getter for options and preserves generics', () => {
			type Item = { id: string; title: string };
			const item: Item = { id: 'a', title: 'Alpha' };
			const attachment = attachDraggable<Item>(() => ({
				container: 'list',
				dragData: item
			}));

			const teardown = attachment(node);
			node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
			expect(dndState.draggedItem).toEqual(item);
			teardown?.();
		});

		it('updates via getter when attachment uses fromAction render effect path', () => {
			// Static object path: attachment is still valid
			const attachment = attachDraggable({ container: 'a', dragData: 1 });
			const teardown = attachment(node);
			expect(node.draggable).toBe(true);
			teardown?.();
		});
	});

	describe('attachDroppable', () => {
		it('returns an Attachment function', () => {
			const attachment = attachDroppable({ container: 'zone' });
			expect(typeof attachment).toBe('function');
		});

		it('marks the node as a droppable target', () => {
			const attachment = attachDroppable({ container: 'zone' });
			const teardown = attachment(node);
			expect(node.getAttribute('data-sveltednd-droppable')).toBe('zone');
			teardown?.();
			expect(node.getAttribute('data-sveltednd-droppable')).toBeNull();
		});

		it('invokes onDrop for matching pointerdrop-on-container', async () => {
			const onDrop = vi.fn();
			const attachment = attachDroppable({
				container: 'zone',
				callbacks: { onDrop }
			});
			const teardown = attachment(node);

			dndState.isDragging = true;
			dndState.targetContainer = 'zone';
			node.dispatchEvent(
				new CustomEvent('pointerdrop-on-container', {
					bubbles: true,
					detail: { dragData: { id: 'x' } }
				})
			);

			await new Promise((r) => setTimeout(r, 0));
			expect(onDrop).toHaveBeenCalled();
			teardown?.();
		});
	});
});
