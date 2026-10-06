<script setup lang="ts">
// QR code em SVG (módulos #18181b; o fundo branco fica no cartão em volta)
const { text, label } = defineProps<{
	text: string
	/** Descrição para leitores de tela */
	label: string
}>()

const matrix = computed(() => qrMatrix(text))
const path = computed(() => qrPath(matrix.value))
</script>

<template>
	<svg
		role="img"
		:aria-label="label"
		:viewBox="`0 0 ${matrix.length} ${matrix.length}`"
		width="100%"
		height="100%"
		shape-rendering="crispEdges"
	>
		<path :d="path" fill="#18181b" />
	</svg>
</template>
