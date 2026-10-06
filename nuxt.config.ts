// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', '@nuxtjs/supabase', '@nuxt/ui', '@nuxt/icon', '@nuxt/test-utils/module'],
	css: ['~/assets/style.css'],
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
