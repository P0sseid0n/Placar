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
			meta: [
				{ name: 'theme-color', content: '#18181b' },
				{
					name: 'description',
					content: 'Crie o placar do seu jogo em segundos e compartilhe com todo mundo por um ID.',
				},
				{ property: 'og:site_name', content: 'Placar' },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:locale', content: 'pt_BR' },
				{ property: 'og:title', content: 'Placar' },
				{
					property: 'og:description',
					content: 'Crie o placar do seu jogo em segundos e compartilhe com todo mundo por um ID.',
				},
				{ name: 'twitter:card', content: 'summary_large_image' },
			],
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
			// Rota própria para o retorno do login: o módulo desliga o SSR nela, e a home precisa de SSR (SEO)
			callback: '/confirmar',
			include: ['/painel'],
			exclude: ['/id/*'],
		},
	},
	runtimeConfig: {
		public: {
			// Endereço oficial, usado no canonical e nos dados estruturados (NUXT_PUBLIC_SITE_URL muda)
			siteUrl: 'https://placar.p0sseid0n.dev',
		},
	},
	routeRules: {
		// Cabeçalhos de segurança de todas as respostas (a Content-Security-Policy das páginas fica em
		// server/plugins/security-headers.ts, porque leva um nonce novo a cada resposta)
		'/**': {
			headers: {
				'X-Content-Type-Options': 'nosniff',
				'X-Frame-Options': 'DENY',
				'Referrer-Policy': 'strict-origin-when-cross-origin',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
			},
		},
		// Placares, painel e retorno do login não entram nos buscadores (a prévia de link continua funcionando)
		'/id/**': { headers: { 'X-Robots-Tag': 'noindex' } },
		'/painel': { headers: { 'X-Robots-Tag': 'noindex' } },
		'/confirmar': { headers: { 'X-Robots-Tag': 'noindex' } },
	},
	nitro: {
		// Na Vercel, o servidor roda em São Paulo, perto do banco (Supabase em sa-east-1)
		vercel: { functions: { regions: ['gru1'] } },
	},
	sourcemap: true,
	compatibilityDate: '2024-09-16',
})
