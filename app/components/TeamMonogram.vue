<script setup lang="ts">
import type { TeamLook } from '~/utils/teamColors'

// Monograma do time: iniciais sobre o fundo da cor do time (ver teamLook)
const {
	name,
	look,
	size = 52,
} = defineProps<{
	name: string
	look: TeamLook
	/** Lado em px: 52 (destaque), 44 (modal) ou 38–40 (prévias) */
	size?: number
}>()

const style = computed(() => ({
	width: `${size}px`,
	height: `${size}px`,
	borderRadius: `${size >= 48 ? 12 : 10}px`,
	fontSize: `${Math.round(size * 0.35)}px`,
	color: look.ink,
	background: look.tint,
	boxShadow: look.edge,
}))
</script>

<template>
	<span aria-hidden="true" class="flex shrink-0 items-center justify-center font-bold" :style="style">
		{{ teamInitials(name) }}
	</span>
</template>
