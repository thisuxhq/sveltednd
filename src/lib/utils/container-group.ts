/**
 * containerGroup matching for nested drag indicators (#76).
 *
 * When both the dragged item and a drop zone declare a group, indicators and
 * target ownership only apply if the groups are equal. Either side unset keeps
 * legacy behavior (accept everything).
 *
 * @module container-group
 */

/** Attribute on droppable nodes so nested ownership can skip incompatible zones. */
export const CONTAINER_GROUP_ATTR = 'data-sveltednd-group';

/**
 * Normalize a group value for comparison.
 * `undefined`, `null`, and `''` mean "no group" (compatible with anything).
 */
export function normalizeContainerGroup(group: string | number | undefined | null): string | null {
	if (group === undefined || group === null || group === '') return null;
	return String(group);
}

/**
 * Whether a drop zone should accept the current drag for indicators / ownership.
 *
 * - Either side without a group → compatible (backward compatible)
 * - Both set → must be equal (string comparison of normalized values)
 */
export function containerGroupsMatch(
	sourceGroup: string | number | undefined | null,
	targetGroup: string | number | undefined | null
): boolean {
	const source = normalizeContainerGroup(sourceGroup);
	const target = normalizeContainerGroup(targetGroup);
	if (source === null || target === null) return true;
	return source === target;
}

/**
 * Find the deepest droppable under `under` that is compatible with `sourceGroup`.
 *
 * Walks up from the element under the pointer, skipping droppables whose
 * `data-sveltednd-group` does not match so a parent of a different hierarchy
 * level can still own the hover (e.g. group shell under nested item zones).
 */
export function findDeepestCompatibleDroppable(
	under: Element | null,
	sourceGroup: string | number | undefined | null
): Element | null {
	let current: Element | null = under;

	while (current) {
		const droppable =
			current instanceof Element ? current.closest('[data-sveltednd-droppable]') : null;
		if (!droppable) return null;

		const attr = droppable.getAttribute(CONTAINER_GROUP_ATTR);
		const targetGroup = attr === null || attr === '' ? null : attr;

		if (containerGroupsMatch(sourceGroup, targetGroup)) {
			return droppable;
		}

		// Skip this incompatible zone; continue from its parent
		current = droppable.parentElement;
	}

	return null;
}
