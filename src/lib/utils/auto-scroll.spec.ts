import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startAutoScroll, stopAutoScroll, _testing } from './auto-scroll.js';

describe('auto-scroll manager', () => {
	let rafId = 1;

	beforeEach(() => {
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((_cb) => {
			return rafId++;
		});
		vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
	});

	afterEach(() => {
		stopAutoScroll();
		vi.restoreAllMocks();
	});

	describe('startAutoScroll / stopAutoScroll lifecycle', () => {
		it('should add document-level pointermove and dragover listeners on start', () => {
			const addSpy = vi.spyOn(document, 'addEventListener');
			startAutoScroll();
			expect(addSpy).toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything());
			expect(addSpy).toHaveBeenCalledWith('dragover', expect.any(Function), expect.anything());
			stopAutoScroll();
		});

		it('should remove listeners and cancel rAF on stop', () => {
			const removeSpy = vi.spyOn(document, 'removeEventListener');
			startAutoScroll();
			stopAutoScroll();
			expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
			expect(removeSpy).toHaveBeenCalledWith('dragover', expect.any(Function));
			expect(window.cancelAnimationFrame).toHaveBeenCalled();
		});

		it('should not add duplicate listeners if called twice', () => {
			const addSpy = vi.spyOn(document, 'addEventListener');
			startAutoScroll();
			startAutoScroll();
			const pointermoveCalls = addSpy.mock.calls.filter((c) => c[0] === 'pointermove');
			expect(pointermoveCalls).toHaveLength(1);
			stopAutoScroll();
		});

		it('should clear scrollable cache on stop', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollHeight', { value: 500 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });

			const styleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'auto',
				overflowX: 'hidden'
			} as CSSStyleDeclaration);

			startAutoScroll();

			// Prime the cache
			_testing.isScrollable(el);
			expect(styleSpy).toHaveBeenCalledTimes(1);

			// Stop clears cache
			stopAutoScroll();

			// Should call getComputedStyle again since cache was cleared
			startAutoScroll();
			_testing.isScrollable(el);
			expect(styleSpy).toHaveBeenCalledTimes(2);

			stopAutoScroll();
		});
	});

	describe('calcScrollSpeed', () => {
		it('should return max speed at edge (distance 0)', () => {
			expect(_testing.calcScrollSpeed(0)).toBe(15);
		});

		it('should return min speed at threshold boundary', () => {
			expect(_testing.calcScrollSpeed(40)).toBe(0);
		});

		it('should interpolate linearly at midpoint', () => {
			const speed = _testing.calcScrollSpeed(20);
			expect(speed).toBeCloseTo(7.5);
		});

		it('should return 0 beyond threshold', () => {
			expect(_testing.calcScrollSpeed(50)).toBe(0);
		});
	});

	describe('isScrollable', () => {
		it('should detect element with overflow auto and scrollable content', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollHeight', { value: 500 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'auto',
				overflowX: 'hidden'
			} as CSSStyleDeclaration);
			expect(_testing.isScrollable(el)).toBe(true);
		});

		it('should return false for non-scrollable element', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollHeight', { value: 200 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'visible',
				overflowX: 'visible'
			} as CSSStyleDeclaration);
			expect(_testing.isScrollable(el)).toBe(false);
		});

		it('should detect horizontal scroll', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollWidth', { value: 500 });
			Object.defineProperty(el, 'clientWidth', { value: 200 });
			Object.defineProperty(el, 'scrollHeight', { value: 200 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'hidden',
				overflowX: 'scroll'
			} as CSSStyleDeclaration);
			expect(_testing.isScrollable(el)).toBe(true);
		});
	});

	describe('getScrollableAncestors', () => {
		it('should find scrollable ancestors walking up the DOM', () => {
			const inner = document.createElement('div');
			const outer = document.createElement('div');
			outer.appendChild(inner);
			document.body.appendChild(outer);

			Object.defineProperty(outer, 'scrollHeight', { value: 500 });
			Object.defineProperty(outer, 'clientHeight', { value: 200 });

			const originalGetComputedStyle = window.getComputedStyle;
			vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
				if (el === outer) {
					return { overflowY: 'auto', overflowX: 'hidden' } as CSSStyleDeclaration;
				}
				return originalGetComputedStyle(el);
			});

			const ancestors = _testing.getScrollableAncestors(inner);
			expect(ancestors).toContain(outer);

			outer.remove();
		});
	});

	describe('exclusion set', () => {
		it('should skip excluded elements', () => {
			const el = document.createElement('div');
			Object.defineProperty(el, 'scrollHeight', { value: 500 });
			Object.defineProperty(el, 'clientHeight', { value: 200 });
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				overflowY: 'auto',
				overflowX: 'hidden'
			} as CSSStyleDeclaration);

			_testing.addExclusion(el);
			expect(_testing.isScrollable(el)).toBe(false);
			_testing.removeExclusion(el);
			expect(_testing.isScrollable(el)).toBe(true);
		});
	});
});
