<script setup lang="ts">
// Stepper de "+N" usado em Novo placar (lg) e Configurações (md). Mínimo 1.
const model = defineModel<number>({ required: true })

const {
	size = 'lg',
	labelledby,
	min = 1,
	disabled = false,
} = defineProps<{
	size?: 'md' | 'lg'
	/** id do texto que nomeia o grupo */
	labelledby?: string
	min?: number
	disabled?: boolean
}>()

const sizes = {
	lg: { button: 'size-11', icon: 'size-5', value: 'w-16 text-[32px]' },
	md: { button: 'size-10', icon: 'size-4.5', value: 'w-14 text-[28px]' },
}
</script>

<template>
	<div
		role="group"
		:aria-labelledby="labelledby"
		class="flex items-center gap-1 rounded-card bg-canvas p-1 ring-1 ring-raised ring-inset"
	>
		<button
			type="button"
			aria-label="Diminuir"
			:disabled="disabled || model <= min"
			class="flex cursor-pointer items-center justify-center rounded-btn bg-raised text-white transition-colors hover:bg-edge disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-raised"
			:class="sizes[size].button"
			@click="model = Math.max(min, model - 1)"
		>
			<UIcon name="i-lucide-minus" :class="sizes[size].icon" />
		</button>
		<output
			aria-live="polite"
			class="text-center font-score leading-none font-bold text-white"
			:class="sizes[size].value"
		>
			+{{ model }}
		</output>
		<button
			type="button"
			aria-label="Aumentar"
			:disabled="disabled"
			class="flex cursor-pointer items-center justify-center rounded-btn bg-raised text-white transition-colors hover:bg-edge disabled:cursor-not-allowed disabled:opacity-40"
			:class="sizes[size].button"
			@click="model = model + 1"
		>
			<UIcon name="i-lucide-plus" :class="sizes[size].icon" />
		</button>
	</div>
</template>
