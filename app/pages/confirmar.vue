<script setup lang="ts">
// Retorno do login com Google ou Discord (redirectOptions.callback) e da conexão de contas no perfil
// (?conectar=google|discord). O @nuxtjs/supabase desliga o SSR nesta rota, e o cliente do Supabase troca
// sozinho o ?code= da URL pela sessão. Aqui só esperamos a sessão (ou a conta nova) aparecer.
// Fica fora da "/" para a home continuar com SSR (o conteúdo dela precisa chegar no HTML para o SEO).
useHead({ title: 'Placar | Entrando…' })

const user = useSupabaseUser()
const route = useRoute()
const toast = useToast()

const PROVIDER_LABEL: Record<string, string> = { google: 'Google', discord: 'Discord' }

// Conectando uma conta: a pessoa já está logada, então esperamos o provedor novo aparecer na sessão
const linking = typeof route.query.conectar === 'string' ? route.query.conectar : null
const linkingLabel = linking ? (PROVIDER_LABEL[linking] ?? linking) : ''

// Se a sessão não aparecer nesse tempo, algo deu errado na troca do código
const TIMEOUT_MS = 15_000

function errorDescription(): string {
	const fromQuery = route.query.error_description
	if (typeof fromQuery === 'string') return fromQuery
	return new URLSearchParams(route.hash.slice(1)).get('error_description') ?? ''
}

function fail() {
	if (linking) {
		// A conta já pertence a outro usuário do Placar: o Supabase não deixa ligar a dois usuários
		const alreadyLinked = /already linked|already exists/i.test(errorDescription())
		toast.add({
			color: 'error',
			title: `Não foi possível conectar o ${linkingLabel}`,
			description: alreadyLinked
				? `Essa conta do ${linkingLabel} já está ligada a outro usuário do Placar.`
				: 'Tente novamente.',
		})
		navigateTo('/painel', { replace: true })
		return
	}

	toast.add({ color: 'error', title: 'Não foi possível entrar', description: 'Tente novamente.' })
	navigateTo('/', { replace: true })
}

const done = computed(() => {
	if (!user.value) return false
	if (!linking) return true
	const providers = (user.value.app_metadata?.providers as string[] | undefined) ?? []
	return providers.includes(linking)
})

let timer: ReturnType<typeof setTimeout> | undefined

// O provedor e o Supabase devolvem ?error=... quando a pessoa cancela ou algo falha.
// Confere antes de olhar a sessão: na conexão de contas a pessoa já chega logada.
if (route.query.error || route.hash.includes('error=')) {
	onMounted(fail)
} else {
	watch(
		done,
		value => {
			if (!value) return
			clearTimeout(timer)
			if (linking) toast.add({ color: 'success', title: `Conta do ${linkingLabel} conectada` })
			navigateTo('/painel', { replace: true })
		},
		{ immediate: true },
	)

	onMounted(() => {
		timer = setTimeout(() => {
			if (!done.value) fail()
		}, TIMEOUT_MS)
	})
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
	<main class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas bg-dots p-4 text-center">
		<AppLogo :size="40" />
		<p role="status" class="flex items-center gap-2 text-[15px] text-fg-soft">
			<UIcon name="i-lucide-loader-circle" class="size-4.5 animate-spin" aria-hidden="true" />
			{{ linking ? `Conectando o ${linkingLabel}…` : 'Entrando…' }}
		</p>
	</main>
</template>
