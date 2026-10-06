<script setup lang="ts">
// Logomarca: quadrado branco com duas barras (a segunda a 45%) + "Placar".
// As proporções seguem o design de 32px: raio 8, barras 4×14, espaço 3, texto 22.
const {
	size = 32,
	label = true,
	textSize,
	tag = 'span',
	fluid = false,
} = defineProps<{
	/** Lado do quadrado, em px */
	size?: number
	/** Mostra o texto "Placar" ao lado */
	label?: boolean
	/** Tamanho do texto em px (padrão: proporcional ao quadrado) */
	textSize?: number
	/** Elemento raiz, ex.: 'h1' na tela de login */
	tag?: string
	/**
	 * Medidas em `em`, acompanhando o font-size definido por classe no componente
	 * (ex.: `text-[clamp(64px,10vw,112px)]` na tela de login). Ignora `size` e `textSize`.
	 */
	fluid?: boolean
}>()

// Em `fluid`, o quadrado tem 0.72em do texto, como no design da tela de login
const unit = (px: number) => (fluid ? `${(px / 32) * 0.72}em` : `${(px / 32) * size}px`)

const markStyle = computed(() => ({
	width: unit(32),
	height: unit(32),
	borderRadius: unit(8),
	gap: unit(3),
}))

const barStyle = computed(() => ({
	width: unit(4),
	height: unit(14),
	borderRadius: unit(2),
}))

const rootStyle = computed(() =>
	fluid
		? { gap: '0.18em' }
		: {
				gap: unit(10),
				fontSize: `${textSize ?? Math.round(size * 0.6875)}px`,
			},
)
</script>

<template>
	<component :is="tag" class="inline-flex items-center leading-none font-bold text-white" :style="rootStyle">
		<span aria-hidden="true" class="flex shrink-0 items-center justify-center bg-white" :style="markStyle">
			<span class="bg-canvas" :style="barStyle" />
			<span class="bg-canvas opacity-45" :style="barStyle" />
		</span>
		<span v-if="label" class="tracking-[-0.01em]">Placar</span>
		<span v-else class="sr-only">Placar</span>
	</component>
</template>
