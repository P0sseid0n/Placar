// Prévia de link (WhatsApp, Discord etc.): og:image e og:url precisam de URL absoluta.
// Fica num plugin do servidor, e não no app, porque assim entra em toda página:
// a "/" não tem SSR (é a rota de callback do login do @nuxtjs/supabase) e a página de erro não passa pelo app.vue.
// Usa o endereço da própria requisição, então funciona em qualquer domínio do deploy.

const escapeAttr = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineNitroPlugin(nitroApp => {
	nitroApp.hooks.hook('render:html', (html, { event }) => {
		const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
		const meta: Record<string, string> = {
			'og:image': `${url.origin}/og-image.jpg`,
			'og:image:width': '1200',
			'og:image:height': '630',
			'og:image:alt': 'Placar: crie o placar do seu jogo e compartilhe por um ID',
		}
		// A página de erro é renderizada internamente em /__nuxt_error: aí não há URL certa para indicar
		if (!url.pathname.startsWith('/__nuxt_error')) meta['og:url'] = `${url.origin}${url.pathname}`

		html.head.push(
			...Object.entries(meta).map(
				([property, content]) => `<meta property="${property}" content="${escapeAttr(content)}">`,
			),
		)
	})
})
