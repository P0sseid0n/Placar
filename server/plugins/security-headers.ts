// Content-Security-Policy das páginas HTML, com um nonce novo a cada resposta.
// Os outros cabeçalhos de segurança (que valem também para arquivos e API) ficam no routeRules do nuxt.config.ts.
//
// Só os scripts que o próprio Nuxt coloca na página recebem o nonce: um script injetado (XSS)
// ou carregado de outro domínio é bloqueado pelo navegador.
// Em desenvolvimento a CSP fica desligada (o Vite usa scripts e conexões que ela bloquearia).

import { randomBytes } from 'node:crypto'

const SCRIPT_TAG_RE = /<script\b/g

/** Origem do Supabase para o connect-src: HTTP (API e login) e WebSocket (Realtime) */
function supabaseOrigins(url: string | undefined): string[] {
	if (!url) return []
	try {
		const { origin, host, protocol } = new URL(url)
		return [origin, `${protocol === 'https:' ? 'wss' : 'ws'}://${host}`]
	} catch {
		return []
	}
}

function buildCsp(nonce: string, supabaseUrl: string | undefined): string {
	// Nos deploys de prévia da Vercel aparece a barra de comentários (vercel.live)
	const preview = process.env.VERCEL_ENV === 'preview'
	const vercelLive = preview ? ['https://vercel.live'] : []

	const directives: Record<string, string[]> = {
		'default-src': ["'self'"],
		'script-src': ["'self'", `'nonce-${nonce}'`, ...vercelLive],
		// Vue e Nuxt UI usam atributos style (cores dos times, animações)
		'style-src': ["'self'", "'unsafe-inline'", ...vercelLive],
		// Fotos de perfil do Google e do Discord; QR code e download usam data: e blob:
		'img-src': ["'self'", 'data:', 'blob:', 'https:'],
		'font-src': ["'self'", 'data:', ...vercelLive],
		'connect-src': [
			"'self'",
			...supabaseOrigins(supabaseUrl),
			...(preview ? ['https://vercel.live', 'wss://ws-us3.pusher.com'] : []),
		],
		'frame-src': preview ? vercelLive : ["'none'"],
		'worker-src': ["'self'", 'blob:'],
		'manifest-src': ["'self'"],
		'object-src': ["'none'"],
		'base-uri': ["'self'"],
		'form-action': ["'self'"],
		// Ninguém coloca o Placar dentro de um iframe (contra clickjacking)
		'frame-ancestors': ["'none'"],
	}

	const csp = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`)
	// Em produção tudo é HTTPS; no preview local (Supabase em http://127.0.0.1) isso quebraria as conexões
	if (supabaseUrl?.startsWith('https:')) csp.push('upgrade-insecure-requests')
	return csp.join('; ')
}

export default defineNitroPlugin(nitroApp => {
	if (import.meta.dev) return

	nitroApp.hooks.hook('render:html', (html, { event }) => {
		const nonce = randomBytes(16).toString('base64')
		event.context.cspNonce = nonce

		const addNonce = (chunks: string[]) =>
			chunks.map(chunk => chunk.replace(SCRIPT_TAG_RE, `<script nonce="${nonce}"`))
		html.head = addNonce(html.head)
		html.bodyPrepend = addNonce(html.bodyPrepend)
		html.body = addNonce(html.body)
		html.bodyAppend = addNonce(html.bodyAppend)
	})

	nitroApp.hooks.hook('render:response', (response, { event }) => {
		if (!response.headers) return
		// Não anuncia o framework (o Nuxt manda "X-Powered-By: Nuxt")
		delete response.headers['x-powered-by']

		const nonce = event.context.cspNonce as string | undefined
		if (!nonce) return
		const supabaseUrl = (useRuntimeConfig(event).public.supabase as { url?: string } | undefined)?.url
		response.headers['content-security-policy'] = buildCsp(nonce, supabaseUrl)
	})
})
