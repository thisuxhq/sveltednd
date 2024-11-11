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
		{ path: '/multiple', title: 'Multiple' }
	];

	const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
</script>

<div class="mx-auto min-h-screen w-full bg-gray-100">
	<div class="flex flex-col">
		<nav class="hidden border-b bg-white px-8 py-4 md:sticky md:top-0 md:block">
			<div class="flex items-center justify-between">
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
				<div class="flex gap-2">
					<a
						href="https://github.com/thisuxhq/sveltednd"
						class="flex items-center gap-2 rounded-md bg-[#24292e] px-4 py-2 text-sm text-white hover:bg-[#1b1f23]"
						target="_blank"
						rel="noopener noreferrer"
					>
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						GitHub
					</a>
					<a
						href="https://www.npmjs.com/package/@thisux/sveltednd"
						class="flex items-center gap-2 rounded-md bg-[#cb3837] px-4 py-2 text-sm text-white hover:bg-[#ab3231]"
						target="_blank"
						rel="noopener noreferrer"
					>
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"
							/>
						</svg>
						NPM
					</a>
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
