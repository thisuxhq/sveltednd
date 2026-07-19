import { describe, it, expect, afterEach, vi } from 'vitest';
import { announce, destroyLiveRegion, _testing } from './live-region.js';

describe('live-region', () => {
	afterEach(() => {
		destroyLiveRegion();
		vi.restoreAllMocks();
	});

	it('creates an assertive live region on first announce', async () => {
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
			cb(0);
			return 0;
		});

		announce('Item grabbed');
		const el = document.getElementById(_testing.LIVE_REGION_ID);
		expect(el).not.toBeNull();
		expect(el?.getAttribute('aria-live')).toBe('assertive');
		expect(el?.textContent).toBe('Item grabbed');
	});

	it('ignores empty messages', () => {
		announce('');
		expect(document.getElementById(_testing.LIVE_REGION_ID)).toBeNull();
	});
});
