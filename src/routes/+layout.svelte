<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import pkg from '../../package.json' with { type: 'json' };
	import { ORG, SITE, buildJsonLd } from '$lib/seo.js';

	let { children } = $props();

	/** Keep demo chrome in sync with package.json (release-please bumps this). */
	const version = pkg.version;
	const jsonLd = JSON.stringify(buildJsonLd(version));
	// Split closing tag so the HTML parser does not end this Svelte script block early
	const jsonLdHtml = '<script type="application/ld+json">' + jsonLd + '<' + '/script>';

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
		{ path: '/conditional-check', title: 'conditional check', number: '10' },
		{ path: '/attach', title: 'attachments', number: '11' },
		{ path: '/keyboard', title: 'keyboard', number: '12' }
	];

	const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

	// Theme management
	let isDark = $state(false);

	onMount(() => {
		// Check initial state from html class (set by inline script in app.html)
		isDark = document.documentElement.classList.contains('dark');
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}
</script>

<svelte:head>
	<meta name="author" content={ORG.name} />
	<meta name="robots" content="index, follow" />
	<meta name="generator" content="{SITE.name} demo" />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:image" content="{SITE.url}{SITE.ogImagePath}" />
	<meta property="og:image:alt" content="{SITE.name} by {ORG.name}" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{SITE.url}{SITE.ogImagePath}" />
	<link rel="alternate" type="text/plain" title="LLM documentation" href="/llms.txt" />
	<!-- Trusted static JSON-LD graph (ORG + SoftwareApplication); not user input -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdHtml}
</svelte:head>

<div class="flex min-h-screen">
	<!-- Swiss Grid Sidebar -->
	<aside
		class="hidden w-72 border-r border-swiss-black bg-white dark:border-white/20 dark:bg-swiss-black md:block"
	>
		<div class="flex h-full flex-col">
			<!-- Logo section with geometric accent -->
			<div class="border-b border-swiss-black p-8 pb-10 dark:border-white/20">
				<div class="flex items-start justify-between">
					<div>
						<div class="mb-2 h-3 w-3 bg-swiss-red"></div>
						<h1 class="text-2xl tracking-tight text-swiss-black dark:text-white">sveltednd</h1>
						<p class="mt-1 text-sm text-swiss-mid-gray dark:text-white/60">drag & drop library</p>
					</div>
					<div class="text-right">
						<span class="text-xs text-swiss-mid-gray dark:text-white/60">v{version}</span>
					</div>
				</div>
			</div>

			<!-- Navigation with numbers -->
			<div class="flex-1 overflow-y-auto">
				{#each examples as { path, title, number }, index (path)}
					<a
						href={path}
						class={cn(
							'group flex items-baseline gap-4 px-8 py-4 transition-colors',
							index > 0 ? 'border-t border-swiss-gray dark:border-white/10' : '',
							'hover:bg-swiss-gray dark:hover:bg-white/10',
							$page.url.pathname === path
								? 'bg-swiss-gray text-swiss-black dark:bg-white/10 dark:text-white'
								: 'text-swiss-dark-gray dark:text-white/70'
						)}
					>
						<span class="text-xs text-swiss-mid-gray dark:text-white/50">{number}</span>
						<span class="text-sm">{title}</span>
					</a>
				{/each}
			</div>

			<!-- Footer links + THISUX brand -->
			<div class="border-t border-swiss-black dark:border-white/20">
				<div class="border-b border-swiss-gray px-8 py-4 dark:border-white/10">
					<p class="text-xs leading-relaxed text-swiss-dark-gray dark:text-white/60">
						Open source by
						<a
							href={ORG.url}
							class="text-swiss-black underline-offset-2 hover:text-swiss-red hover:underline dark:text-white dark:hover:text-swiss-red"
							target="_blank"
							rel="noopener noreferrer"
						>
							{ORG.name}
						</a>
					</p>
					<a
						href={ORG.url}
						class="mt-2 inline-block text-xs text-swiss-black hover:text-swiss-red dark:text-white dark:hover:text-swiss-red"
						target="_blank"
						rel="noopener noreferrer"
					>
						thisux.com · available for projects →
					</a>
				</div>
				<div class="flex gap-6 px-8 py-4">
					<a
						href={SITE.github}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-swiss-dark-gray transition-colors hover:text-swiss-black dark:text-white/70 dark:hover:text-white"
					>
						github →
					</a>
					<a
						href={SITE.npm}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-swiss-dark-gray transition-colors hover:text-swiss-red dark:text-white/70 dark:hover:text-swiss-red"
					>
						npm →
					</a>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main content area -->
	<main class="min-w-0 flex-1 bg-white dark:bg-swiss-black">
		{@render children()}
	</main>
</div>

<!-- Mobile header -->
<header
	class="fixed left-0 right-0 top-0 z-40 border-b border-swiss-black bg-white dark:border-white/20 dark:bg-swiss-black md:hidden"
>
	<div class="flex items-center justify-between px-4 py-3">
		<div class="flex items-center gap-2">
			<div class="h-2 w-2 bg-swiss-red"></div>
			<span class="text-lg dark:text-white">sveltednd</span>
			<span class="text-xs text-swiss-mid-gray dark:text-white/60">v{version}</span>
		</div>
	</div>
</header>

<!-- Mobile navigation -->
<nav
	class="fixed bottom-0 left-0 right-0 z-50 border-t border-swiss-black bg-white dark:border-white/20 dark:bg-swiss-black md:hidden"
>
	<div class="flex gap-1 overflow-x-auto px-2 py-2">
		{#each examples as { path, title } (path)}
			<a
				href={path}
				class={cn(
					'whitespace-nowrap px-3 py-2 text-xs transition-colors',
					$page.url.pathname === path
						? 'bg-swiss-black text-white dark:bg-white dark:text-swiss-black'
						: 'text-swiss-dark-gray dark:text-white/70'
				)}
			>
				{title}
			</a>
		{/each}
	</div>
</nav>

<!-- Theme toggle - positioned at far right -->
<button
	onclick={toggleTheme}
	class="fixed right-4 top-4 z-50 text-xs text-swiss-mid-gray transition-colors hover:text-swiss-black dark:text-white/60 dark:hover:text-white md:right-8 md:top-8"
	aria-label="Toggle theme"
>
	{isDark ? 'light' : 'dark'}
</button>

<!-- Mobile badge -->
<div class="fixed bottom-20 left-4 right-4 z-40 md:hidden">
	<div
		class="flex items-center justify-between gap-3 border border-swiss-black bg-white px-4 py-3 dark:border-white/20 dark:bg-swiss-black"
	>
		<div class="min-w-0">
			<div class="flex items-center gap-2">
				<div class="h-2 w-2 shrink-0 bg-swiss-red"></div>
				<span class="truncate text-xs text-swiss-dark-gray dark:text-white/60">{ORG.name}</span>
			</div>
		</div>
		<a
			href={ORG.url}
			class="shrink-0 text-xs text-swiss-black dark:text-white"
			target="_blank"
			rel="noopener noreferrer"
		>
			thisux.com →
		</a>
	</div>
</div>
