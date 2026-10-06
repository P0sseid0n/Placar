<script setup lang="ts">
// Seletor de cor do time: a escolhida ganha anel branco; a cor do outro time fica desativada.
const model = defineModel<string>({ required: true })

const { taken, label, disabled = false } = defineProps<{
	/** Cor do outro time */
	taken: string
	/** Nome do grupo para leitores de tela, ex.: "Cor do primeiro time" */
	label: string
	disabled?: boolean
}>()
</script>

<template>
	<div role="group" :aria-label="label" class="flex flex-wrap gap-0.5 pt-1">
		<button
			v-for="color in TEAM_COLORS"
			:key="color.hex"
			type="button"
			:aria-label="color.name"
			:aria-pressed="model === color.hex"
			:disabled="disabled || color.hex === taken"
			class="flex size-11 cursor-pointer items-center justify-center rounded-field disabled:cursor-not-allowed disabled:opacity-25"
			@click="model = color.hex"
		>
			<span
				class="size-[26px] rounded-full"
				:class="model === color.hex && 'shadow-[0_0_0_3px_var(--color-surface),0_0_0_5px_#ffffff]'"
				:style="{ background: color.hex }"
			/>
		</button>
	</div>
</template>
