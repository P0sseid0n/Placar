// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', '@nuxtjs/supabase', '@nuxt/ui', '@nuxt/fonts', '@nuxt/icon'],
	css: ['~/assets/css/base-classes.css'],
	supabase: {
		redirectOptions: {
			login: '/',
			callback: '/',
			include: ['/painel'],
			exclude: ['/id/*'],
		},
		types: './DatabaseDefinitions.ts',
	},
	compatibilityDate: '2024-09-16',
})
