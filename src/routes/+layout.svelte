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

			<!-- Sidebar footer with GitHub and NPM buttons -->
			<div class="border-t p-4">
				<div class="flex gap-2">
					<a
						href="https://github.com/yourusername/svelte-dnd"
						target="_blank"
						class="flex-1 rounded-md bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
					>
						GitHub
					</a>
					<a
						href="https://www.npmjs.com/package/your-package"
						target="_blank"
						class="flex-1 rounded-md bg-[#CB3837] px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#B02E2E]"
					>
						NPM
					</a>
				</div>
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

<!-- Redesigned floating badge -->
<footer class="fixed bottom-8 right-8 z-50 hidden md:block">
	<div
		class="group relative overflow-hidden rounded-lg border bg-white/90 px-6 py-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/95"
	>
		<div class="flex flex-col items-start gap-3">
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 rounded-full bg-green-500"></div>
				<span class="text-sm font-medium text-green-600">Available for Projects</span>
			</div>
			<div class="space-y-1">
				<h3 class="text-sm font-medium text-gray-900">Let's build something amazing</h3>
				<p class="text-sm text-gray-500">Product design & development studio</p>
			</div>
			<a
				href="https://thisux.com"
				class="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
				target="_blank"
				rel="noopener noreferrer"
			>
				Book a call →
				<svg
					class="h-4 w-4 transition-transform group-hover:translate-x-1"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M14 5l7 7m0 0l-7 7m7-7H3"
					/>
				</svg>
			</a>
		</div>
	</div>
</footer>

<!-- Static text on mobile (above bottom nav) -->
<div class="flex flex-col items-center justify-center gap-1 border-t bg-white px-4 py-3 md:hidden">
	<div class="flex items-center gap-2">
		<div class="h-2 w-2 rounded-full bg-green-500"></div>
		<span class="text-xs font-medium text-green-600">Available for Projects</span>
	</div>
	<a
		href="https://cal.com/imsanju/15min"
		class="hover:text-primary text-xs font-medium text-gray-900"
		target="_blank"
		rel="noopener noreferrer"
	>
		Book a call →
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
