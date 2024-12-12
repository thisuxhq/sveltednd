<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	const examples = [
		{ path: '/', title: 'Kanban Board' },
		{ path: '/simple-list', title: 'Simple List' },
		{ path: '/horizontal-scroll', title: 'Horizontal Scroll' },
		{ path: '/grid-sort', title: 'Grid Sort' },
		{ path: '/nested', title: 'Nested Containers' },
		{ path: '/multiple', title: 'Multiple' },
		{ path: '/custom-classes', title: 'Custom Classes' },
		{ path: '/interactive-elements', title: 'Interactives' },
		{ path: '/conditional-check', title: 'Conditional Check' }
	];

	const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
</script>

<div class="flex min-h-screen bg-gray-100">
	<!-- Sidebar -->
	<aside class="hidden w-64 border-r bg-white md:block">
		<div class="flex h-full flex-col">
			<!-- Logo section -->
			<div class="border-b p-4">
				<div class="flex flex-col space-y-1">
					<h1 class="text-primary text-xl font-semibold">SvelteDnD</h1>
					<a href="https://thisux.com" target="_blank" class="hover:text-primary text-xs"
						>by ThisUX</a
					>
				</div>
			</div>

			<!-- Navigation links -->
			<div class="flex-1 overflow-y-auto p-4">
				{#each examples as { path, title }}
					<a
						href={path}
						class={cn(
							'block rounded px-3 py-2 text-sm font-medium transition-colors',
							'hover:text-primary hover:bg-gray-100',
							$page.url.pathname === path ? 'text-primary bg-gray-100' : 'text-gray-600'
						)}
					>
						{title}
					</a>
				{/each}
			</div>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex-1">
		{@render children()}
	</div>
</div>

<!-- Mobile bottom navigation -->
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

<!-- Floating badge (hidden on mobile)-->
<footer class="fixed bottom-8 right-8 z-50 hidden md:block">
	<div
		class="flex flex-col items-center justify-center gap-2 rounded-lg border bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm"
	>
		<p class="text-sm font-light tracking-wide text-gray-500">
			ThisUX, a forward-thinking product studio
		</p>
		<a
			href="https://thisux.com"
			class="hover:text-primary group flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors"
			target="_blank"
			rel="noopener noreferrer"
		>
			thisux.com
			<span class="text-xs opacity-0 transition-opacity group-hover:opacity-100">→</span>
		</a>
	</div>
</footer>

<!-- Static text on mobile (above bottom nav) -->
<div class="flex flex-col items-center justify-center gap-1 border-t bg-white px-4 py-3 md:hidden">
	<p class="text-xs font-light tracking-wide text-gray-500">
		ThisUX, a forward-thinking product studio
	</p>
	<a
		href="https://thisux.com"
		class="hover:text-primary text-xs font-medium text-gray-900"
		target="_blank"
		rel="noopener noreferrer"
	>
		thisux.com
	</a>
</div>

<style>
	footer {
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
		100% {
			transform: translateY(0px);
		}
	}
</style>
