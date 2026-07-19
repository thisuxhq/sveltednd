/**
 * Keyboard drag session — grab / arrow-move / drop / cancel (#24).
 *
 * Shares dndState and droppable commitDrop with pointer/HTML5 paths.
 * Opt-in only (started from draggable when keyboard: true).
 *
 * @module keyboard-session
 */

import { dndState, resetDndState } from '$lib/stores/dnd.svelte.js';
import type {
	DragDropState,
	KeyboardAnnouncementContext,
	KeyboardOptions
} from '$lib/types/index.js';
import {
	clearAllKeyboardHovers,
	indexOfElement,
	listKeyboardTargets,
	type DroppableDirection,
	type DroppableRegistration
} from './dnd-registry.js';
import { announce } from './live-region.js';
import { stopAutoScroll } from './auto-scroll.js';

export interface KeyboardSessionConfig {
	sourceElement: HTMLElement;
	sourceContainer: string;
	dragData: unknown;
	draggingClass: string[];
	direction: DroppableDirection;
	keyboard: KeyboardOptions;
	itemLabel: string;
	onDragStart?: (state: DragDropState) => void;
	onDragEnd?: (state: DragDropState) => void;
}

interface Session {
	config: KeyboardSessionConfig;
	targets: DroppableRegistration[];
	targetIndex: number;
	documentKeyHandler: (event: KeyboardEvent) => void;
}

let session: Session | null = null;

export function isKeyboardSessionActive(): boolean {
	return session !== null;
}

function buildContext(): KeyboardAnnouncementContext {
	if (!session) {
		return {
			itemLabel: '',
			sourceContainer: '',
			targetContainer: null,
			position: null,
			total: null
		};
	}
	const { config, targets, targetIndex } = session;
	const target = targets[targetIndex];
	return {
		itemLabel: config.itemLabel,
		sourceContainer: config.sourceContainer,
		targetContainer: target?.container ?? null,
		position: targets.length ? targetIndex + 1 : null,
		total: targets.length || null
	};
}

function defaultAnnouncements() {
	return {
		grabbed: (ctx: KeyboardAnnouncementContext) =>
			`${ctx.itemLabel || 'Item'} grabbed. Current position ${ctx.position} of ${ctx.total}. ` +
			`Use arrow keys to change position, Space or Enter to drop, Escape to cancel.`,
		moved: (ctx: KeyboardAnnouncementContext) =>
			`${ctx.itemLabel || 'Item'}. Position ${ctx.position} of ${ctx.total}.`,
		dropped: (ctx: KeyboardAnnouncementContext) =>
			`${ctx.itemLabel || 'Item'} dropped. Final position ${ctx.position} of ${ctx.total}.`,
		cancelled: (ctx: KeyboardAnnouncementContext) =>
			`${ctx.itemLabel || 'Item'} reorder cancelled.`,
		invalid: (ctx: KeyboardAnnouncementContext) => `Cannot drop ${ctx.itemLabel || 'item'} here.`
	};
}

function announceWith(
	kind: keyof ReturnType<typeof defaultAnnouncements>,
	overrides?: KeyboardOptions['announcements']
) {
	const defaults = defaultAnnouncements();
	const formatter = overrides?.[kind] ?? defaults[kind];
	announce(formatter(buildContext()));
}

function applyTargetPreview(): void {
	if (!session) return;
	clearAllKeyboardHovers();

	const target = session.targets[session.targetIndex];
	if (!target) {
		dndState.targetContainer = null;
		dndState.targetElement = null;
		dndState.dropPosition = null;
		return;
	}

	// Drop "on" a slot: use before when moving toward lower indices conceptually,
	// after when the target is the same as source — apps using index containers
	// read targetContainer + dropPosition the same as pointer path.
	const position: 'before' | 'after' =
		session.targetIndex >= indexOfElement(session.targets, session.config.sourceElement)
			? 'after'
			: 'before';

	dndState.targetContainer = target.container;
	dndState.targetElement = target.element;
	dndState.dropPosition = position;
	dndState.invalidDrop = false;

	target.setKeyboardHover(true, position);

	// Allow apps to mark invalidDrop via onDragOver if they registered callbacks
	// through the droppable options (invoked inside setKeyboardHover if wired).
}

function finishSession(options: { announceKind?: 'dropped' | 'cancelled' | 'invalid' | null }) {
	if (!session) return;
	const { config, documentKeyHandler } = session;

	document.removeEventListener('keydown', documentKeyHandler, true);
	clearAllKeyboardHovers();
	stopAutoScroll();

	config.sourceElement.classList.remove(...config.draggingClass);
	config.sourceElement.removeAttribute('aria-grabbed');

	if (options.announceKind) {
		announceWith(options.announceKind, config.keyboard.announcements);
	}

	const endState = { ...dndState } as DragDropState;
	config.onDragEnd?.(endState);

	session = null;
	resetDndState();
}

async function commitDrop(): Promise<void> {
	if (!session) return;

	if (dndState.invalidDrop) {
		finishSession({ announceKind: 'invalid' });
		return;
	}

	const target = session.targets[session.targetIndex];
	if (!target) {
		finishSession({ announceKind: 'cancelled' });
		return;
	}

	const dropState = { ...dndState } as DragDropState;
	const { config, documentKeyHandler } = session;

	document.removeEventListener('keydown', documentKeyHandler, true);
	clearAllKeyboardHovers();
	stopAutoScroll();
	config.sourceElement.classList.remove(...config.draggingClass);
	config.sourceElement.removeAttribute('aria-grabbed');

	try {
		await target.commitDrop(dropState);
	} catch (error) {
		console.error('Keyboard drop handling failed:', error);
	}

	announceWith('dropped', config.keyboard.announcements);
	const endState = { ...dndState } as DragDropState;
	// commitDrop may have already reset global state (#60); still fire onDragEnd
	config.onDragEnd?.(endState.isDragging ? endState : dropState);
	session = null;
	if (dndState.isDragging) {
		resetDndState();
	}
}

function handleDocumentKeydown(event: KeyboardEvent): void {
	if (!session) return;

	const key = event.key;

	if (key === 'Escape') {
		event.preventDefault();
		event.stopPropagation();
		finishSession({ announceKind: 'cancelled' });
		return;
	}

	if (key === ' ' || key === 'Enter') {
		event.preventDefault();
		event.stopPropagation();
		void commitDrop();
		return;
	}

	const direction = session.config.direction;
	const horizontal = direction === 'horizontal';
	let delta = 0;

	if (horizontal) {
		if (key === 'ArrowRight' || key === 'ArrowDown') delta = 1;
		if (key === 'ArrowLeft' || key === 'ArrowUp') delta = -1;
	} else {
		// vertical + grid: prefer vertical arrows; also allow horizontal as secondary
		if (key === 'ArrowDown' || key === 'ArrowRight') delta = 1;
		if (key === 'ArrowUp' || key === 'ArrowLeft') delta = -1;
	}

	if (delta === 0) return;

	event.preventDefault();
	event.stopPropagation();

	const next = Math.max(0, Math.min(session.targets.length - 1, session.targetIndex + delta));
	if (next === session.targetIndex) return;

	session.targetIndex = next;
	applyTargetPreview();
	announceWith('moved', session.config.keyboard.announcements);
}

/**
 * Starts a keyboard drag session from a focused draggable.
 * No-ops if a session is already active.
 */
export function startKeyboardSession(config: KeyboardSessionConfig): void {
	if (session) return;
	if (dndState.isDragging) return;

	const targets = listKeyboardTargets(config.direction);
	if (targets.length === 0) return;

	let targetIndex = indexOfElement(targets, config.sourceElement);
	if (targetIndex < 0) targetIndex = 0;

	const documentKeyHandler = handleDocumentKeydown;

	session = {
		config,
		targets,
		targetIndex,
		documentKeyHandler
	};

	dndState.isDragging = true;
	dndState.draggedItem = config.dragData;
	dndState.sourceContainer = config.sourceContainer;
	dndState.targetContainer = null;
	dndState.targetElement = null;
	dndState.dropPosition = null;
	dndState.invalidDrop = false;
	dndState.dragInput = 'keyboard';

	config.sourceElement.classList.add(...config.draggingClass);
	config.sourceElement.setAttribute('aria-grabbed', 'true');

	document.addEventListener('keydown', documentKeyHandler, true);

	applyTargetPreview();
	config.onDragStart?.(dndState as DragDropState);
	announceWith('grabbed', config.keyboard.announcements);
}

/**
 * Cancel any active keyboard session (e.g. draggable destroy).
 */
export function cancelKeyboardSession(): void {
	if (!session) return;
	finishSession({ announceKind: null });
}

/** Testing helpers */
export const _testing = {
	getSession: () => session,
	reset() {
		if (session) {
			document.removeEventListener('keydown', session.documentKeyHandler, true);
			session = null;
		}
		clearAllKeyboardHovers();
		resetDndState();
	}
};
