<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps<{
	error: NuxtError
}>()

const user = useSupabaseUser()

const MESSAGES: Record<number, { title: string; text: string }> = {
	400: { title: 'ID inválido', text: 'O ID do placar tem 6 caracteres, só letras minúsculas e números.' },
	404: { title: 'Página não encontrada', text: 'Esse endereço não existe. Confira o link ou volte para o início.' },
	500: {
		title: 'Erro interno do servidor',
		text: 'Algo deu errado do nosso lado. Tente de novo em alguns instantes.',
	},
}

const PLACAR_NOT_FOUND_MESSAGE = {
	title: 'Placar não encontrado',
	text: 'Esse placar não existe ou foi apagado. Confira o ID com quem compartilhou.',
}

const code = computed(() => error.statusCode || 500)

// No SSR o Nuxt pode entregar `data` como string JSON
function errorReason(): string | undefined {
	let data: unknown = error.data
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data)
		} catch {
			return undefined
		}
	}
	return (data as { reason?: string } | undefined)?.reason
}

const content = computed(() => {
	if (code.value === 404 && errorReason() === PLACAR_NOT_FOUND) return PLACAR_NOT_FOUND_MESSAGE

	return MESSAGES[code.value] ?? { title: 'Erro desconhecido', text: 'Tente de novo em alguns instantes.' }
})

useHead({ title: () => `Placar | ${content.value.title}` })
</script>

<template>
	<div class="flex min-h-screen flex-col bg-canvas bg-dots text-fg">
		<header class="flex h-[72px] items-center px-[clamp(16px,5vw,64px)]">
			<NuxtLink to="/" class="rounded-btn" aria-label="Placar, ir para o início">
				<AppLogo />
			</NuxtLink>
		</header>

		<main class="flex flex-1 flex-col items-center justify-center gap-3 px-4 pt-8 pb-24 text-center">
			<div role="img" :aria-label="`Erro ${code}`" class="mb-7 flex gap-[clamp(8px,1.5vw,14px)]">
				<span
					v-for="(digit, index) in String(code).split('')"
					:key="index"
					aria-hidden="true"
					class="relative flex h-[clamp(104px,16vw,168px)] w-[clamp(76px,12vw,128px)] items-center justify-center overflow-hidden rounded-[clamp(12px,1.6vw,18px)] bg-surface font-score text-[clamp(84px,13vw,140px)] leading-none font-bold text-white shadow-[inset_0_0_0_1px_var(--color-raised),0_20px_50px_rgba(0,0,0,0.4)]"
				>
					{{ digit }}
					<span class="absolute inset-x-0 top-1/2 h-0.5 bg-canvas" />
				</span>
			</div>

			<h1 class="text-[clamp(24px,3vw,32px)] leading-tight font-bold text-white">{{ content.title }}</h1>
			<p class="max-w-[420px] text-base text-fg-soft">{{ content.text }}</p>

			<div class="mt-5 flex flex-wrap justify-center gap-2.5">
				<UButton
					to="/"
					color="neutral"
					variant="solid"
					icon="i-lucide-arrow-left"
					label="Voltar para o início"
					class="h-12 gap-2 rounded-field px-5 text-[15px] font-semibold hover:bg-fg"
				/>
				<UButton
					v-if="user"
					to="/painel"
					color="neutral"
					variant="subtle"
					label="Ir para o painel"
					class="h-12 rounded-field bg-raised px-5 text-[15px] font-semibold text-white ring-edge hover:bg-edge"
				/>
			</div>
		</main>
	</div>
</template>
