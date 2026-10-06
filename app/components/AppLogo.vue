<script setup lang="ts">
// Logomarca: quadrado branco com duas barras (a segunda a 45%) + "Placar".
// As proporções seguem o design de 32px: raio 8, barras 4×14, espaço 3, texto 22.
const {
	size = 32,
	label = true,
	textSize,
	tag = 'span',
} = defineProps<{
	/** Lado do quadrado, em px */
	size?: number
	/** Mostra o texto "Placar" ao lado */
	label?: boolean
	/** Tamanho do texto em px (padrão: proporcional ao quadrado) */
	textSize?: number
	/** Elemento raiz, ex.: 'h1' na tela de login */
	tag?: string
}>()

const markStyle = computed(() => ({
	width: `${size}px`,
	height: `${size}px`,
	borderRadius: `${size * 0.25}px`,
	gap: `${size * 0.094}px`,
}))

const barStyle = computed(() => ({
	width: `${size * 0.125}px`,
	height: `${size * 0.4375}px`,
	borderRadius: `${size * 0.0625}px`,
}))

const rootStyle = computed(() => ({
	gap: `${size * 0.3125}px`,
	fontSize: `${textSize ?? Math.round(size * 0.6875)}px`,
}))
</script>

<template>
	<component :is="tag" class="inline-flex items-center font-bold leading-none text-white" :style="rootStyle">
		<span aria-hidden="true" class="flex shrink-0 items-center justify-center bg-white" :style="markStyle">
			<span class="bg-canvas" :style="barStyle" />
			<span class="bg-canvas opacity-45" :style="barStyle" />
		</span>
		<span v-if="label" class="tracking-[-0.01em]">Placar</span>
		<span v-else class="sr-only">Placar</span>
	</component>
</template>
