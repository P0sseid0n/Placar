// Sitemap gerado a partir do endereço oficial (runtimeConfig.public.siteUrl), sem domínio fixo no arquivo.
// Só entram as páginas públicas e indexáveis: placares, painel e retorno do login ficam de fora (noindex).
// Sem <lastmod>: uma data desatualizada atrapalha mais do que ajuda, e ela é opcional para os buscadores.

const PAGES = ['/', '/termos', '/privacidade']

export default defineEventHandler(event => {
	const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')
	const urls = PAGES.map(path => `\t<url>\n\t\t<loc>${siteUrl}${path}</loc>\n\t</url>`).join('\n')

	setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
	setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
