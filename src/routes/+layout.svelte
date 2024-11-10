<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	const examples = [
		{ path: '/', title: 'Kanban Board' },
		{ path: '/simple-list', title: 'Simple List' },
		{ path: '/horizontal-scroll', title: 'Horizontal Scroll' },
		{ path: '/grid-sort', title: 'Grid Sort' },
		{ path: '/nested', title: 'Nested Containers' }
	];

	const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
</script>

<div class="mx-auto min-h-screen max-w-screen-xl bg-gray-50">
	<div class="flex flex-col">
		<nav class="hidden border-b bg-white px-8 py-4 md:sticky md:top-0 md:block">
			<div class="flex gap-4 overflow-x-auto whitespace-nowrap">
				<div class="flex-1 overflow-hidden">
					<div class="flex gap-4 overflow-x-auto whitespace-nowrap">
						{#each examples as { path, title }}
							<a
								href={path}
								class={cn(
									'rounded px-3 py-1 text-sm hover:bg-gray-100',
									$page.url.pathname === path ? 'text-primary rounded-md bg-gray-100' : ''
								)}
							>
								{title}
							</a>
						{/each}
					</div>
				</div>
			</div>
		</nav>
		{@render children()}
		<nav class="sticky bottom-0 border-t bg-white px-8 py-4 md:hidden">
			<div class="flex gap-4 overflow-x-auto whitespace-nowrap">
				<div class="flex-1 overflow-hidden">
					<div class="flex gap-4 overflow-x-auto whitespace-nowrap">
						{#each examples as { path, title }}
							<a
								href={path}
								class={cn(
									'rounded px-3 py-1 text-sm hover:bg-gray-100',
									$page.url.pathname === path ? 'text-primary rounded-md bg-gray-100' : ''
								)}
							>
								{title}
							</a>
						{/each}
					</div>
				</div>
			</div>
		</nav>
	</div>
</div>
