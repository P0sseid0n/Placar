<script setup lang="ts">
// Retorno do login com Discord (redirectOptions.callback). O @nuxtjs/supabase desliga o SSR nesta rota,
// e o cliente do Supabase troca sozinho o ?code= da URL pela sessão. Aqui só esperamos a sessão aparecer.
// Fica fora da "/" para a home continuar com SSR (o conteúdo dela precisa chegar no HTML para o SEO).
useHead({ title: 'Placar | Entrando…' })

const user = useSupabaseUser()
const route = useRoute()
const toast = useToast()

// Se a sessão não aparecer nesse tempo, algo deu errado na troca do código
const TIMEOUT_MS = 15_000

function fail() {
	toast.add({ color: 'error', title: 'Não foi possível entrar com o Discord', description: 'Tente novamente.' })
	navigateTo('/', { replace: true })
}

watch(
	user,
	value => {
		if (value) navigateTo('/painel', { replace: true })
	},
	{ immediate: true },
)

let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
	// O Discord e o Supabase devolvem ?error=... quando a pessoa cancela ou algo falha
	if (route.query.error || route.hash.includes('error=')) return fail()
	timer = setTimeout(() => {
		if (!user.value) fail()
	}, TIMEOUT_MS)
})

onUnmounted(() => clearTimeout(timer))
</script>

<template>
	<main class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas bg-dots p-4 text-center">
		<AppLogo :size="40" />
		<p role="status" class="flex items-center gap-2 text-[15px] text-fg-soft">
			<UIcon name="i-lucide-loader-circle" class="size-4.5 animate-spin" aria-hidden="true" />
			Entrando com o Discord…
		</p>
	</main>
</template>
