<script setup lang="ts">
// Seletor de cor do time (id da paleta): a escolhida ganha anel branco; a cor do outro time fica desativada.
const model = defineModel<string>({ required: true })

const {
	taken,
	label,
	disabled = false,
} = defineProps<{
	/** Id da cor do outro time */
	taken: string
	/** Nome do grupo para leitores de tela, ex.: "Cor do primeiro time" */
	label: string
	disabled?: boolean
}>()

const SELECTED = '0 0 0 3px var(--color-surface), 0 0 0 5px #ffffff'

const options = computed(() =>
	TEAM_PALETTE.map(color => {
		const look = teamLook(color.id)
		const selected = model.value === color.id
		return {
			...look,
			selected,
			ring: selected ? [SELECTED, look.swEdge].filter(r => r !== 'none').join(', ') : look.swEdge,
		}
	}),
)
</script>

<template>
	<div role="group" :aria-label="label" class="flex flex-wrap gap-0.5 pt-1">
		<button
			v-for="option in options"
			:key="option.id"
			type="button"
			:aria-label="option.name"
			:title="option.name"
			:aria-pressed="option.selected"
			:disabled="disabled || option.id === taken"
			class="flex size-11 cursor-pointer items-center justify-center rounded-field disabled:cursor-not-allowed disabled:opacity-25"
			@click="model = option.id"
		>
			<span class="size-[26px] rounded-full" :style="{ background: option.dot, boxShadow: option.ring }" />
		</button>
	</div>
</template>
