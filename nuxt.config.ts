// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', '@nuxtjs/supabase', '@nuxt/ui', '@nuxt/icon', '@nuxt/test-utils/module', '@nuxt/eslint'],
	css: ['~/assets/style.css'],
	app: {
		head: {
			htmlAttrs: { class: 'dark', lang: 'pt-BR' },
			link: [
				{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
			],
			meta: [{ name: 'theme-color', content: '#18181b' }],
		},
	},
	fonts: {
		// Open Sans para texto e Barlow Condensed para números (baixadas no build pelo @nuxt/fonts)
		families: [
			{ name: 'Open Sans', weights: [400, 500, 600, 700] },
			{ name: 'Barlow Condensed', weights: [600, 700] },
		],
	},
	ui: {
		// Projeto usa somente o tema dark
		colorMode: false,
	},
	icon: {
		// Embute no client só os ícones usados no código, em vez das coleções inteiras no servidor
		clientBundle: { scan: true },
		serverBundle: 'remote',
	},
	supabase: {
		redirectOptions: {
			login: '/',
			callback: '/',
			include: ['/painel'],
			exclude: ['/id/*'],
		},
	},
	sourcemap: true,
	compatibilityDate: '2024-09-16',
})
