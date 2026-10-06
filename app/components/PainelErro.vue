<script setup lang="ts">
defineEmits<{ retry: [] }>()
</script>

<template>
	<section
		role="alert"
		class="flex flex-col items-center gap-4 rounded-panel bg-surface px-6 py-[clamp(32px,6vw,64px)] text-center ring-1 ring-raised ring-inset"
	>
		<span
			aria-hidden="true"
			class="flex size-16 items-center justify-center rounded-feature bg-error/10 ring-1 ring-error/30 ring-inset"
		>
			<UIcon name="i-lucide-triangle-alert" class="size-7.5 text-error" />
		</span>
		<h2 class="text-[22px] leading-7.5 font-bold text-white">Não foi possível carregar seus placares</h2>
		<p class="max-w-100 text-[15px] leading-5.5 text-fg-soft">
			Verifique sua conexão e tente de novo. Seus placares continuam salvos.
		</p>
		<UButton
			color="neutral"
			variant="subtle"
			icon="i-lucide-rotate-cw"
			label="Tentar novamente"
			class="mt-2 h-12 gap-2 rounded-field bg-raised px-4.5 text-[15px] font-semibold text-white ring-edge hover:bg-edge"
			@click="$emit('retry')"
		/>
	</section>
</template>
