import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { draggable } from '../actions/draggable.js';
import { droppable } from '../actions/droppable.js';
import { dndState } from '../stores/dnd.svelte.js';
import { _testing as registryTesting } from './dnd-registry.js';
import { _testing as sessionTesting, isKeyboardSessionActive } from './keyboard-session.js';
import { destroyLiveRegion } from './live-region.js';

describe('keyboard accessibility (issue #24)', () => {
	let items: HTMLElement[];
	let actions: Array<{ destroy: () => void }>;

	beforeEach(() => {
		sessionTesting.reset();
		registryTesting.clearAll();
		destroyLiveRegion();
		dndState.isDragging = false;
		dndState.draggedItem = null;
		dndState.sourceContainer = '';
		dndState.targetContainer = null;
		dndState.dragInput = null;
		items = [];
		actions = [];

		// Three stacked drop/drag items (simple-list pattern)
		for (let i = 0; i < 3; i++) {
			const el = document.createElement('div');
			el.textContent = `Item ${i}`;
			document.body.appendChild(el);
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				top: i * 50,
				left: 0,
				bottom: i * 50 + 40,
				right: 200,
				width: 200,
				height: 40,
				x: 0,
				y: i * 50,
				toJSON: () => ({})
			});
			items.push(el);
		}
	});

	afterEach(() => {
		for (const a of actions) a.destroy();
		for (const el of items) el.remove();
		sessionTesting.reset();
		registryTesting.clearAll();
		destroyLiveRegion();
	});

	function mountList(onDrop = vi.fn()) {
		items.forEach((el, i) => {
			actions.push(
				draggable(el, {
					container: String(i),
					dragData: { id: String(i), title: `Item ${i}` },
					keyboard: true
				})
			);
			actions.push(
				droppable(el, {
					container: String(i),
					callbacks: { onDrop }
				})
			);
		});
		return onDrop;
	}

	it('does not set tabindex when keyboard is off', () => {
		const el = items[0];
		const action = draggable(el, { container: '0', dragData: 1 });
		actions.push(action);
		expect(el.getAttribute('data-sveltednd-keyboard')).toBeNull();
		expect(el.tabIndex).toBeLessThan(0);
	});

	it('sets tabindex when keyboard is enabled', () => {
		const el = items[0];
		const action = draggable(el, { container: '0', dragData: 1, keyboard: true });
		actions.push(action);
		expect(el.tabIndex).toBe(0);
		expect(el.getAttribute('data-sveltednd-keyboard')).toBe('true');
	});

	it('grabs on Space and sets keyboard dragInput', () => {
		mountList();
		const el = items[0];
		el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));

		expect(isKeyboardSessionActive()).toBe(true);
		expect(dndState.isDragging).toBe(true);
		expect(dndState.dragInput).toBe('keyboard');
		expect(dndState.draggedItem).toEqual({ id: '0', title: 'Item 0' });
		expect(el.getAttribute('aria-grabbed')).toBe('true');
	});

	it('moves target with ArrowDown and drops with Space', async () => {
		const onDrop = mountList();
		const el = items[0];
		el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));

		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		);
		expect(dndState.targetContainer).toBe('1');

		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
		);

		await new Promise((r) => setTimeout(r, 0));

		expect(onDrop).toHaveBeenCalled();
		expect(isKeyboardSessionActive()).toBe(false);
		expect(dndState.isDragging).toBe(false);
		expect(dndState.dragInput).toBeNull();
	});

	it('cancels on Escape without calling onDrop', async () => {
		const onDrop = mountList();
		items[0].dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		);
		expect(dndState.isDragging).toBe(true);

		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		);

		await new Promise((r) => setTimeout(r, 0));

		expect(onDrop).not.toHaveBeenCalled();
		expect(dndState.isDragging).toBe(false);
		expect(isKeyboardSessionActive()).toBe(false);
	});

	it('does not grab when focus is on an interactive child', () => {
		const el = items[0];
		const input = document.createElement('input');
		el.appendChild(input);
		actions.push(
			draggable(el, {
				container: '0',
				dragData: { id: '0' },
				keyboard: true
			})
		);

		input.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
		);
		expect(dndState.isDragging).toBe(false);
		expect(isKeyboardSessionActive()).toBe(false);
	});
});
