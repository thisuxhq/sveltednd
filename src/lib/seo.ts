/**
 * Shared SEO + brand helpers for the SvelteDnD demo site.
 *
 * Keeps product pages technical while consistently attributing
 * THISUX Private Limited (https://thisux.com) as publisher/creator.
 */

export const SITE = {
	name: '@thisux/sveltednd',
	shortName: 'SvelteDnD',
	url: 'https://sveltednd.thisux.com',
	description:
		'A lightweight, type-safe drag and drop library for Svelte 5. HTML5 + pointer/touch, keyboard, and attachments. Open source by THISUX Private Limited.',
	ogImagePath: '/og.png',
	github: 'https://github.com/thisuxhq/sveltednd',
	npm: 'https://www.npmjs.com/package/@thisux/sveltednd',
	license: 'https://opensource.org/licenses/MIT'
} as const;

export const ORG = {
	name: 'THISUX Private Limited',
	url: 'https://thisux.com',
	email: 'hello@thisux.com',
	/** Stable @id for JSON-LD graph linking */
	id: 'https://thisux.com/#organization'
} as const;

/** Demo routes included in sitemap + internal nav. */
export const DEMO_ROUTES = [
	{ path: '/', title: 'Kanban board' },
	{ path: '/simple-list', title: 'Simple list' },
	{ path: '/horizontal-scroll', title: 'Horizontal scroll' },
	{ path: '/grid-sort', title: 'Grid sort' },
	{ path: '/nested', title: 'Nested containers' },
	{ path: '/multiple', title: 'Multiple containers' },
	{ path: '/custom-classes', title: 'Custom classes' },
	{ path: '/drag-handle', title: 'Drag handle' },
	{ path: '/interactive-elements', title: 'Interactive elements' },
	{ path: '/conditional-check', title: 'Conditional check' },
	{ path: '/attach', title: 'Attachments' },
	{ path: '/keyboard', title: 'Keyboard accessibility' }
] as const;

const BRAND_SIGNATURE = `Open-source Svelte 5 DnD by ${ORG.name}.`;

export type PageSeoInput = {
	/** Short page title (demo name). Full document title is derived. */
	title: string;
	/** Technical description of the demo / page. Brand clause is appended. */
	description: string;
	/** Path only, e.g. `/keyboard` or `/` */
	path: string;
};

export type PageSeo = {
	title: string;
	description: string;
	canonical: string;
	ogImage: string;
	ogType: 'website';
	siteName: string;
	author: string;
	robots: string;
};

/**
 * Build consistent title/description/canonical/OG fields for a demo page.
 * Brand line is appended once so product copy stays useful for search.
 */
export function buildPageSeo(input: PageSeoInput): PageSeo {
	const path = input.path === '' ? '/' : input.path.startsWith('/') ? input.path : `/${input.path}`;
	const isHome = path === '/';

	const title = isHome
		? `${SITE.name} · Modern drag and drop for Svelte 5`
		: `${input.title} · ${SITE.shortName}`;

	const baseDescription = input.description.trim().replace(/\s+/g, ' ');
	const description = baseDescription.includes(ORG.name)
		? baseDescription
		: `${baseDescription} ${BRAND_SIGNATURE}`.trim();

	return {
		title,
		description,
		canonical: path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`,
		ogImage: `${SITE.url}${SITE.ogImagePath}`,
		ogType: 'website',
		siteName: SITE.name,
		author: ORG.name,
		robots: 'index, follow'
	};
}

/** Homepage defaults when layout has no page-specific override yet. */
export const DEFAULT_HOME_SEO = buildPageSeo({
	title: SITE.shortName,
	description: SITE.description,
	path: '/'
});

/**
 * JSON-LD @graph: Organization (THISUX) + SoftwareApplication + WebSite.
 * Links product discovery to thisux.com as publisher.
 */
export function buildJsonLd(version?: string): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': ORG.id,
				name: ORG.name,
				url: ORG.url,
				email: ORG.email,
				sameAs: ['https://github.com/thisuxhq', SITE.npm, SITE.github]
			},
			{
				'@type': 'SoftwareApplication',
				'@id': `${SITE.url}/#software`,
				name: SITE.name,
				alternateName: ['SvelteDnD', 'sveltednd'],
				description: SITE.description,
				url: SITE.url,
				applicationCategory: 'DeveloperApplication',
				operatingSystem: 'Web',
				softwareVersion: version,
				license: SITE.license,
				codeRepository: SITE.github,
				downloadUrl: SITE.npm,
				offers: {
					'@type': 'Offer',
					price: '0',
					priceCurrency: 'USD'
				},
				author: { '@id': ORG.id },
				publisher: { '@id': ORG.id },
				creator: { '@id': ORG.id }
			},
			{
				'@type': 'WebSite',
				'@id': `${SITE.url}/#website`,
				name: `${SITE.shortName} demos`,
				url: SITE.url,
				description: SITE.description,
				publisher: { '@id': ORG.id },
				inLanguage: 'en'
			}
		]
	};
}
