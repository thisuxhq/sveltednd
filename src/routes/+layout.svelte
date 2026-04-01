<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	const examples = [
		{ path: '/', title: 'kanban board', number: '01' },
		{ path: '/simple-list', title: 'simple list', number: '02' },
		{ path: '/horizontal-scroll', title: 'horizontal scroll', number: '03' },
		{ path: '/grid-sort', title: 'grid sort', number: '04' },
		{ path: '/nested', title: 'nested containers', number: '05' },
		{ path: '/multiple', title: 'multiple', number: '06' },
		{ path: '/custom-classes', title: 'custom classes', number: '07' },
		{ path: '/drag-handle', title: 'drag handle', number: '08' },
		{ path: '/interactive-elements', title: 'interactive elements', number: '09' },
		{ path: '/conditional-check', title: 'conditional check', number: '10' }
	];

	const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
</script>

<div class="flex min-h-screen">
	<!-- Swiss Grid Sidebar -->
	<aside class="hidden w-72 border-r border-swiss-black bg-white md:block">
		<div class="flex h-full flex-col">
			<!-- Logo section with geometric accent -->
			<div class="border-b border-swiss-black p-8 pb-10">
				<div class="flex items-start justify-between">
					<div>
						<div class="mb-2 h-3 w-3 bg-swiss-red"></div>
						<h1 class="text-2xl tracking-tight text-swiss-black">sveltednd</h1>
						<p class="mt-1 text-sm text-swiss-mid-gray">drag & drop library</p>
					</div>
					<div class="text-right">
						<span class="text-xs text-swiss-mid-gray">v0.0.20</span>
					</div>
				</div>
			</div>

			<!-- Navigation with numbers -->
			<div class="flex-1 overflow-y-auto">
				{#each examples as { path, title, number }, index}
					<a
						href={path}
						class={cn(
							'group flex items-baseline gap-4 px-8 py-4 transition-colors',
							index > 0 ? 'border-t border-swiss-gray' : '',
							'hover:bg-swiss-gray',
							$page.url.pathname === path
								? 'bg-swiss-gray text-swiss-black'
								: 'text-swiss-dark-gray'
						)}
					>
						<span class="text-xs text-swiss-mid-gray">{number}</span>
						<span class="text-sm">{title}</span>
					</a>
				{/each}
			</div>

			<!-- Footer links -->
			<div class="border-t border-swiss-black p-8">
				<div class="flex gap-6">
					<a
						href="https://github.com/thisuxhq/sveltednd"
						target="_blank"
						class="text-sm text-swiss-dark-gray transition-colors hover:text-swiss-black"
					>
						github →
					</a>
					<a
						href="https://www.npmjs.com/package/@thisux/sveltednd"
						target="_blank"
						class="text-sm text-swiss-dark-gray transition-colors hover:text-swiss-red"
					>
						npm →
					</a>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main content area -->
	<main class="min-w-0 flex-1 bg-white">
		{@render children()}
	</main>
</div>

<!-- Mobile header -->
<header class="fixed left-0 right-0 top-0 z-50 border-b border-swiss-black bg-white md:hidden">
	<div class="flex items-center justify-between px-4 py-3">
		<div class="flex items-center gap-2">
			<div class="h-2 w-2 bg-swiss-red"></div>
			<span class="text-lg">sveltednd</span>
		</div>
		<span class="text-xs text-swiss-mid-gray">v0.0.20</span>
	</div>
</header>

<!-- Mobile navigation -->
<nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-swiss-black bg-white md:hidden">
	<div class="flex gap-1 overflow-x-auto px-2 py-2">
		{#each examples as { path, title }}
			<a
				href={path}
				class={cn(
					'whitespace-nowrap px-3 py-2 text-xs transition-colors',
					$page.url.pathname === path ? 'bg-swiss-black text-white' : 'text-swiss-dark-gray'
				)}
			>
				{title}
			</a>
		{/each}
	</div>
</nav>

<!-- Swiss Grid geometric accent - static badge -->
<footer class="fixed bottom-8 right-8 z-50 hidden md:block">
	<div class="flex items-center gap-3">
		<div class="h-px w-12 bg-swiss-black"></div>
		<div class="flex items-center gap-2 border border-swiss-black bg-white px-4 py-2">
			<div class="h-2 w-2 bg-swiss-red"></div>
			<span class="text-xs text-swiss-dark-gray">available for projects</span>
			<a
				href="https://thisux.com"
				class="ml-2 text-xs text-swiss-black hover:text-swiss-red"
				target="_blank"
				rel="noopener noreferrer"
			>
				thisux.com →
			</a>
		</div>
	</div>
</footer>

<!-- Mobile badge -->
<div class="fixed bottom-20 left-4 right-4 z-40 md:hidden">
	<div class="flex items-center justify-between border border-swiss-black bg-white px-4 py-3">
		<div class="flex items-center gap-2">
			<div class="h-2 w-2 bg-swiss-red"></div>
			<span class="text-xs text-swiss-dark-gray">available for projects</span>
		</div>
		<a href="https://thisux.com" class="text-xs text-swiss-black" target="_blank"> thisux.com → </a>
	</div>
</div>
