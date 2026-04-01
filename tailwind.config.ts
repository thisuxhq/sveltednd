import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['"Google Sans"', 'system-ui', 'sans-serif']
			},
			fontWeight: {
				light: '400',
				normal: '500',
				medium: '500',
				semibold: '500',
				bold: '500'
			},
			fontSize: {
				xs: ['0.75rem', { lineHeight: '1rem' }],
				sm: ['0.875rem', { lineHeight: '1.25rem' }],
				base: ['1rem', { lineHeight: '1.5rem' }],
				lg: ['1.125rem', { lineHeight: '1.75rem' }],
				xl: ['1.5rem', { lineHeight: '2rem' }],
				'2xl': ['2rem', { lineHeight: '2.5rem' }],
				'3xl': ['2.5rem', { lineHeight: '3rem' }],
				'4xl': ['3.5rem', { lineHeight: '1' }]
			},
			colors: {
				/* Swiss Grid Design: Black, White, Red */
				swiss: {
					black: '#0a0a0a',
					white: '#ffffff',
					red: '#dc2626',
					gray: '#f5f5f5',
					'mid-gray': '#a3a3a3',
					'dark-gray': '#404040'
				},
				primary: {
					DEFAULT: '#dc2626',
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#ef4444',
					600: '#dc2626',
					700: '#b91c1c',
					800: '#991b1b',
					900: '#7f1d1d'
				},
				muted: {
					DEFAULT: '#a3a3a3',
					foreground: '#a3a3a3'
				}
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
				'30': '7.5rem'
			}
		}
	},

	plugins: []
} satisfies Config;
