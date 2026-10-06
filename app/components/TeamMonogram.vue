<script setup lang="ts">
// Monograma do time: iniciais na cor do time, sobre a mesma cor a ~14% (alfa 24 em hex)
const { name, color, size = 52 } = defineProps<{
	name: string
	/** Cor do time em hex de 6 dígitos (#rrggbb) */
	color: string
	/** Lado em px: 52 (destaque), 44 (modal) ou 38–40 (prévias) */
	size?: number
}>()

const style = computed(() => ({
	width: `${size}px`,
	height: `${size}px`,
	borderRadius: `${size >= 48 ? 12 : 10}px`,
	fontSize: `${Math.round(size * 0.35)}px`,
	color,
	background: `${color}24`,
}))
</script>

<template>
	<span aria-hidden="true" class="flex shrink-0 items-center justify-center font-bold" :style="style">
		{{ teamInitials(name) }}
	</span>
</template>
