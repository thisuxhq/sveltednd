/**
 * Assertive ARIA live region for keyboard drag announcements (#24).
 *
 * Creates a single visually-hidden region on first use and reuses it for
 * all subsequent announces so screen readers get immediate status updates.
 *
 * @module live-region
 */

const LIVE_REGION_ID = 'sveltednd-live-region';

let region: HTMLElement | null = null;

function ensureRegion(): HTMLElement | null {
	if (typeof document === 'undefined') return null;

	if (region && document.body.contains(region)) return region;

	const existing = document.getElementById(LIVE_REGION_ID);
	if (existing) {
		region = existing;
		return region;
	}

	const el = document.createElement('div');
	el.id = LIVE_REGION_ID;
	el.setAttribute('role', 'status');
	el.setAttribute('aria-live', 'assertive');
	el.setAttribute('aria-atomic', 'true');
	// Visually hidden but available to AT
	el.style.cssText =
		'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
	document.body.appendChild(el);
	region = el;
	return region;
}

/**
 * Announces a message to assistive technology via an assertive live region.
 * Empty strings are ignored. The region is cleared briefly before setting
 * text so repeated identical messages are still announced.
 */
export function announce(message: string): void {
	if (!message) return;
	const el = ensureRegion();
	if (!el) return;

	el.textContent = '';
	// Force a DOM tick so AT picks up the next string even if identical
	requestAnimationFrame(() => {
		el.textContent = message;
	});
}

/** Remove the live region (tests / full teardown). */
export function destroyLiveRegion(): void {
	if (region?.parentNode) {
		region.parentNode.removeChild(region);
	}
	region = null;
	const existing = typeof document !== 'undefined' ? document.getElementById(LIVE_REGION_ID) : null;
	existing?.remove();
}

/** Testing helpers */
export const _testing = {
	LIVE_REGION_ID,
	ensureRegion,
	getRegion: () => region
};
