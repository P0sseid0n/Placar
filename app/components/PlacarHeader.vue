<script setup lang="ts">
// Cabeçalho da página do placar: voltar, logomarca, "Ao vivo" e ações do dono ou do visitante
const { isOwner, live } = defineProps<{
	isOwner: boolean
	/** Realtime conectado */
	live: boolean
}>()

defineEmits<{
	share: []
	settings: []
	telao: []
}>()
</script>

<template>
	<header class="border-b border-raised">
		<div
			class="mx-auto grid h-18 max-w-360 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-[clamp(16px,4vw,48px)]"
		>
			<div class="flex justify-start">
				<NuxtLink
					:to="isOwner ? '/painel' : '/'"
					class="inline-flex h-11 items-center gap-1 rounded-btn pr-3.5 pl-2 text-sm font-semibold text-fg-strong transition-colors hover:bg-raised hover:text-white"
				>
					<UIcon name="i-lucide-chevron-left" class="size-5.5" aria-hidden="true" />
					{{ isOwner ? 'Painel' : 'Início' }}
				</NuxtLink>
			</div>

			<AppLogo :size="28" :text-size="20" :label="true" class="max-[400px]:[&>span:last-child]:sr-only" />

			<div class="flex items-center justify-end gap-2">
				<LiveBadge v-if="live" class="max-[720px]:hidden" />

				<template v-if="isOwner">
					<UButton
						color="neutral"
						variant="subtle"
						icon="i-lucide-share"
						aria-label="Compartilhar"
						aria-haspopup="dialog"
						class="h-11 gap-2 rounded-btn bg-raised px-3.5 text-sm font-semibold text-fg ring-edge hover:bg-edge"
						:ui="{ leadingIcon: 'size-4.5' }"
						@click="$emit('share')"
					>
						<span class="max-[720px]:hidden">Compartilhar</span>
					</UButton>
					<UButton
						color="neutral"
						variant="subtle"
						icon="i-lucide-settings"
						aria-label="Configurações"
						class="size-11 justify-center rounded-btn bg-raised text-fg ring-edge hover:bg-edge"
						:ui="{ leadingIcon: 'size-5' }"
						@click="$emit('settings')"
					/>
				</template>

				<UButton
					v-else
					color="neutral"
					variant="solid"
					icon="i-lucide-scan"
					aria-label="Modo telão"
					class="h-11 gap-2 rounded-btn px-3.5 text-sm font-semibold hover:bg-fg"
					:ui="{ leadingIcon: 'size-4.5' }"
					@click="$emit('telao')"
				>
					<span class="max-[720px]:hidden">Modo telão</span>
				</UButton>
			</div>
		</div>
	</header>
</template>
