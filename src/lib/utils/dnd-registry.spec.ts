import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	registerDroppable,
	unregisterDroppable,
	listKeyboardTargets,
	indexOfElement,
	_testing,
	type DroppableRegistration
} from './dnd-registry.js';

function makeEntry(
	el: HTMLElement,
	container: string,
	overrides: Partial<DroppableRegistration> = {}
): DroppableRegistration {
	return {
		element: el,
		container,
		direction: 'vertical',
		disabled: false,
		setKeyboardHover: () => {},
		commitDrop: () => {},
		...overrides
	};
}

describe('dnd-registry', () => {
	beforeEach(() => {
		_testing.clearAll();
	});

	it('registers and unregisters droppables', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);
		const entry = makeEntry(el, 'a');
		registerDroppable(entry);
		expect(_testing.size()).toBe(1);
		unregisterDroppable(entry);
		expect(_testing.size()).toBe(0);
		el.remove();
	});

	it('sorts targets top-to-bottom for vertical lists', () => {
		const a = document.createElement('div');
		const b = document.createElement('div');
		document.body.appendChild(a);
		document.body.appendChild(b);

		vi.spyOn(a, 'getBoundingClientRect').mockReturnValue({
			top: 100,
			left: 0,
			bottom: 140,
			right: 100,
			width: 100,
			height: 40,
			x: 0,
			y: 100,
			toJSON: () => ({})
		});
		vi.spyOn(b, 'getBoundingClientRect').mockReturnValue({
			top: 20,
			left: 0,
			bottom: 60,
			right: 100,
			width: 100,
			height: 40,
			x: 0,
			y: 20,
			toJSON: () => ({})
		});

		registerDroppable(makeEntry(a, '1'));
		registerDroppable(makeEntry(b, '0'));

		const targets = listKeyboardTargets('vertical');
		expect(targets.map((t) => t.container)).toEqual(['0', '1']);

		a.remove();
		b.remove();
	});

	it('prefers deepest droppables over ancestors', () => {
		const parent = document.createElement('div');
		const child = document.createElement('div');
		parent.appendChild(child);
		document.body.appendChild(parent);

		vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
			top: 0,
			left: 0,
			bottom: 200,
			right: 200,
			width: 200,
			height: 200,
			x: 0,
			y: 0,
			toJSON: () => ({})
		});
		vi.spyOn(child, 'getBoundingClientRect').mockReturnValue({
			top: 10,
			left: 10,
			bottom: 50,
			right: 50,
			width: 40,
			height: 40,
			x: 10,
			y: 10,
			toJSON: () => ({})
		});

		registerDroppable(makeEntry(parent, 'parent'));
		registerDroppable(makeEntry(child, 'child'));

		const targets = listKeyboardTargets('vertical');
		expect(targets).toHaveLength(1);
		expect(targets[0].container).toBe('child');

		parent.remove();
	});

	it('indexOfElement finds containing registration', () => {
		const el = document.createElement('div');
		const inner = document.createElement('span');
		el.appendChild(inner);
		document.body.appendChild(el);
		const entry = makeEntry(el, 'x');
		registerDroppable(entry);
		const targets = [entry];
		expect(indexOfElement(targets, inner)).toBe(0);
		el.remove();
	});
});
