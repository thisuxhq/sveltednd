<script lang="ts">
	import { buildPageSeo, type PageSeoInput } from '$lib/seo.js';

	let { title, description, path }: PageSeoInput = $props();

	const seo = $derived(buildPageSeo({ title, description, path }));
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<meta name="author" content={seo.author} />
	<meta name="robots" content={seo.robots} />
	<link rel="canonical" href={seo.canonical} />

	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:type" content={seo.ogType} />
	<meta property="og:url" content={seo.canonical} />
	<meta property="og:site_name" content={seo.siteName} />
	<meta property="og:image" content={seo.ogImage} />
	<meta property="og:image:alt" content="{seo.siteName} by THISUX Private Limited" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.ogImage} />
	<meta name="twitter:image:alt" content="{seo.siteName} by THISUX Private Limited" />
</svelte:head>
