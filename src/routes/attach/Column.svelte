<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		children,
		...props
	}: {
		title: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<section {...props} class={['column-root flex flex-col', props.class].filter(Boolean).join(' ')}>
	<header class="border-b border-swiss-black px-4 py-3 dark:border-white/20">
		<h2 class="text-sm text-swiss-black dark:text-white">{title}</h2>
	</header>
	<div class="flex flex-1 flex-col gap-2 p-3">
		{@render children?.()}
	</div>
</section>
