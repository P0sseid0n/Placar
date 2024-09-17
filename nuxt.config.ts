// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', '@nuxtjs/supabase'],

	supabase: {
		redirect: false,
	},
	compatibilityDate: '2024-09-16',
})
