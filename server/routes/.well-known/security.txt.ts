// security.txt (RFC 9116): onde avisar sobre falhas de segurança.
// O "Expires" é obrigatório; aqui ele fica sempre um ano à frente, então o arquivo nunca vence.

export default defineEventHandler(event => {
	const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')
	const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
	expires.setUTCHours(0, 0, 0, 0)

	setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
	setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
	return [
		`Contact: mailto:${CONTACT_EMAIL}`,
		`Expires: ${expires.toISOString()}`,
		'Preferred-Languages: pt, en',
		`Canonical: ${siteUrl}/.well-known/security.txt`,
		`Policy: ${siteUrl}/termos`,
		'',
	].join('\n')
})
