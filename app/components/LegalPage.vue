<script setup lang="ts">
// Moldura das páginas de Termos de Uso e Política de Privacidade: cabeçalho igual ao da página de erro,
// título, data da última atualização e o texto (estilizado pela classe `legal`, logo abaixo).
const { title, updatedAt } = defineProps<{
	title: string
	/** Data da última atualização, já escrita por extenso (ex.: "5 de novembro de 2026") */
	updatedAt: string
}>()

const user = useSupabaseUser()

useCanonical()

const LINKS = [
	{ to: '/termos', label: 'Termos de Uso' },
	{ to: '/privacidade', label: 'Política de Privacidade' },
]
</script>

<template>
	<div class="flex min-h-dvh flex-col bg-canvas bg-dots text-fg">
		<header class="flex h-18 items-center justify-between gap-4 px-[clamp(16px,5vw,64px)]">
			<NuxtLink to="/" class="rounded-btn" aria-label="Placar, ir para o início">
				<AppLogo />
			</NuxtLink>
			<UButton
				:to="user ? '/painel' : '/'"
				color="neutral"
				variant="subtle"
				icon="i-lucide-arrow-left"
				:label="user ? 'Voltar para o painel' : 'Voltar para o início'"
				class="h-10 gap-2 rounded-field bg-raised px-4 text-sm font-semibold text-white ring-edge hover:bg-edge"
			/>
		</header>

		<main class="flex flex-1 justify-center px-4 pt-6 pb-16 sm:pt-10">
			<article
				class="w-full max-w-180 rounded-panel bg-surface p-[clamp(24px,5vw,56px)] shadow-[inset_0_0_0_1px_var(--color-raised),0_24px_60px_rgba(0,0,0,0.35)]"
			>
				<h1 class="text-[clamp(28px,4vw,36px)] leading-tight font-bold text-white">{{ title }}</h1>
				<p class="mt-2 text-sm text-fg-dim">Última atualização: {{ updatedAt }}</p>

				<div class="legal mt-8">
					<slot />
				</div>
			</article>
		</main>

		<footer class="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 pb-10 text-sm">
			<NuxtLink
				v-for="link in LINKS"
				:key="link.to"
				:to="link.to"
				class="rounded-btn text-fg-soft transition-colors hover:text-white"
				active-class="text-white"
			>
				{{ link.label }}
			</NuxtLink>
		</footer>
	</div>
</template>

<style scoped>
.legal :deep(h2) {
	margin-top: 40px;
	margin-bottom: 12px;
	font-size: 20px;
	line-height: 1.3;
	font-weight: 700;
	color: white;
}

.legal :deep(h2:first-child) {
	margin-top: 0;
}

.legal :deep(p),
.legal :deep(ul) {
	margin-bottom: 14px;
	font-size: 15px;
	line-height: 1.7;
	color: var(--color-fg-strong);
}

.legal :deep(ul) {
	padding-left: 22px;
	list-style: disc;
}

.legal :deep(li) {
	margin-bottom: 6px;
}

.legal :deep(li::marker) {
	color: var(--color-fg-dim);
}

.legal :deep(strong) {
	font-weight: 600;
	color: white;
}

.legal :deep(a) {
	color: white;
	text-decoration: underline;
	text-decoration-color: var(--color-edge);
	text-underline-offset: 3px;
	transition: text-decoration-color 0.15s;
}

.legal :deep(a:hover) {
	text-decoration-color: white;
}
</style>
