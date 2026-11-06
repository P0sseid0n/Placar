// robots.txt com o sitemap no endereço oficial (runtimeConfig.public.siteUrl).
// As páginas que não devem ser indexadas usam o cabeçalho X-Robots-Tag (routeRules no nuxt.config.ts),
// e não Disallow: assim a prévia de link dos placares continua funcionando.

export default defineEventHandler(event => {
	const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')

	setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
	setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
	return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
})
