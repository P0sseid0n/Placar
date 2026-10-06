<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
	error: Object as () => NuxtError,
})

function getErrorText() {
	if (!props.error?.statusMessage) return props.error?.message || 'Erro desconhecido'

	switch (props.error?.statusCode) {
		case 400:
			return 'ID inválido'
		case 404:
			return 'Placar não encontrado'
		case 500:
			return 'Erro interno do servidor'
		default:
			return 'Error desconhecido'
	}
}

const errorFormatted = computed(() => {
	const message = getErrorText()

	return {
		code: props.error?.statusCode || 500,
		message,
	}
})
</script>

<template>
	<div id="Error" class="h-screen w-screen flex flex-col items-center justify-center bg-zinc-900">
		<h1 class="text-9xl">
			{{ errorFormatted.code }}
		</h1>
		<h3 class="text-2xl">
			{{ errorFormatted.message }}
		</h3>

		<NuxtLink to="/" class="mt-32 no-underline text-white text-base cursor-pointer h-12 px-8 flex items-center rounded-lg">
			Voltar para a página inicial
		</NuxtLink>
	</div>
</template>
