// <link rel="canonical"> com o endereço oficial (runtimeConfig.public.siteUrl), para os buscadores
// tratarem o domínio da Vercel e o oficial como a mesma página. Só nas páginas que podem ser indexadas.
export function useCanonical() {
	const siteUrl = useRuntimeConfig().public.siteUrl
	const route = useRoute()
	const url = `${siteUrl}${route.path}`

	useHead({ link: [{ rel: 'canonical', href: url }] })

	return url
}
