<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Minimal component that spreads props onto its root so `{@attach ...}` works.
	 * Any library consumer's card/row/cell can follow this pattern.
	 */
	let {
		children,
		...props
	}: {
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<div {...props} class={['card-root', props.class].filter(Boolean).join(' ')}>
	{@render children?.()}
</div>
