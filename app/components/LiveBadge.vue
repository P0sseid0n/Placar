<script setup lang="ts">
// Selo "Ao vivo" (verde). `sm` na prévia do login, `md` no cabeçalho do placar.
const { size = 'md' } = defineProps<{ size?: 'sm' | 'md' }>()
</script>

<template>
	<span
		class="inline-flex items-center rounded-full bg-success/8 font-semibold text-success ring-1 ring-success/25 ring-inset"
		:class="size === 'sm' ? 'h-[26px] gap-1.5 px-2.5 text-xs' : 'h-8 gap-2 px-3 text-[13px]'"
	>
		<span
			class="rounded-full bg-success"
			:class="size === 'sm' ? 'size-1.5' : 'size-[7px] shadow-[0_0_0_3px_rgba(5,223,114,0.2)]'"
		/>
		Ao vivo
	</span>
</template>
