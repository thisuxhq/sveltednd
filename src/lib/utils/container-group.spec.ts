import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	CONTAINER_GROUP_ATTR,
	containerGroupsMatch,
	findDeepestCompatibleDroppable,
	normalizeContainerGroup
} from './container-group.js';

describe('container-group', () => {
	describe('normalizeContainerGroup', () => {
		it('returns null for unset values', () => {
			expect(normalizeContainerGroup(undefined)).toBeNull();
			expect(normalizeContainerGroup(null)).toBeNull();
			expect(normalizeContainerGroup('')).toBeNull();
		});

		it('stringifies numbers and keeps strings', () => {
			expect(normalizeContainerGroup(0)).toBe('0');
			expect(normalizeContainerGroup(2)).toBe('2');
			expect(normalizeContainerGroup('task')).toBe('task');
		});
	});

	describe('containerGroupsMatch', () => {
		it('is true when either side is unset', () => {
			expect(containerGroupsMatch(undefined, 'task')).toBe(true);
			expect(containerGroupsMatch('task', undefined)).toBe(true);
			expect(containerGroupsMatch(null, null)).toBe(true);
			expect(containerGroupsMatch('', 'group')).toBe(true);
		});

		it('is true when both match', () => {
			expect(containerGroupsMatch('task', 'task')).toBe(true);
			expect(containerGroupsMatch(1, '1')).toBe(true);
			expect(containerGroupsMatch(0, 0)).toBe(true);
		});

		it('is false when both set and differ', () => {
			expect(containerGroupsMatch('task', 'group')).toBe(false);
			expect(containerGroupsMatch(1, 2)).toBe(false);
		});
	});

	describe('findDeepestCompatibleDroppable', () => {
		let parent: HTMLElement;
		let child: HTMLElement;
		let leaf: HTMLElement;

		beforeEach(() => {
			parent = document.createElement('div');
			child = document.createElement('div');
			leaf = document.createElement('div');
			parent.setAttribute('data-sveltednd-droppable', 'parent');
			parent.setAttribute(CONTAINER_GROUP_ATTR, 'group');
			child.setAttribute('data-sveltednd-droppable', 'child');
			child.setAttribute(CONTAINER_GROUP_ATTR, 'item');
			leaf.setAttribute('data-sveltednd-droppable', 'leaf');
			leaf.setAttribute(CONTAINER_GROUP_ATTR, 'item');
			parent.appendChild(child);
			child.appendChild(leaf);
			document.body.appendChild(parent);
		});

		afterEach(() => {
			parent.remove();
		});

		it('returns the deepest matching droppable', () => {
			expect(findDeepestCompatibleDroppable(leaf, 'item')).toBe(leaf);
			expect(findDeepestCompatibleDroppable(leaf, 'group')).toBe(parent);
		});

		it('skips incompatible nested zones to reach a parent', () => {
			expect(findDeepestCompatibleDroppable(child, 'group')).toBe(parent);
		});

		it('returns null when nothing matches', () => {
			expect(findDeepestCompatibleDroppable(leaf, 'other')).toBeNull();
		});

		it('accepts ungrouped droppables for any source group', () => {
			const open = document.createElement('div');
			open.setAttribute('data-sveltednd-droppable', 'open');
			leaf.appendChild(open);
			expect(findDeepestCompatibleDroppable(open, 'group')).toBe(open);
			open.remove();
		});
	});
});
