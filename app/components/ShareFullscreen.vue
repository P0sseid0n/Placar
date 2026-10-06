<script setup lang="ts">
// QR code em tela cheia para TV/projetor (COMPARTILHAR.md). Usa a Fullscreen API quando disponível; Esc fecha.
const { url, publicId, teamA, teamB } = defineProps<{
	url: string
	publicId: string
	teamA: string
	teamB: string
}>()
const emit = defineEmits<{ close: [] }>()

const root = ref<HTMLElement | null>(null)
const closeButton = ref<{ $el: HTMLElement } | null>(null)

function onKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape') close()
}

// Sair da tela cheia pelo navegador (Esc ou F11) também fecha
function onFullscreenChange() {
	if (!document.fullscreenElement) close()
}

let closing = false
async function close() {
	if (closing) return
	closing = true
	document.removeEventListener('fullscreenchange', onFullscreenChange)
	if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
	emit('close')
}

onMounted(async () => {
	document.addEventListener('keydown', onKeydown)
	closeButton.value?.$el.focus()
	try {
		await root.value?.requestFullscreen?.()
		document.addEventListener('fullscreenchange', onFullscreenChange)
	} catch {
		// Sem permissão de tela cheia: a tela continua ocupando a janela
	}
})

onBeforeUnmount(() => {
	document.removeEventListener('keydown', onKeydown)
	document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
	<Teleport to="body">
		<div
			ref="root"
			role="dialog"
			aria-modal="true"
			aria-label="QR code em tela cheia"
			class="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-[clamp(20px,3vh,32px)] overflow-y-auto bg-canvas bg-dots px-4 py-12 text-center"
		>
			<UButton
				ref="closeButton"
				color="neutral"
				variant="ghost"
				icon="i-lucide-x"
				aria-label="Sair da tela cheia"
				class="absolute top-4 right-4 size-11 justify-center rounded-btn text-fg-soft hover:bg-raised hover:text-white"
				:ui="{ leadingIcon: 'size-5' }"
				@click="close"
			/>

			<div class="flex flex-col gap-1.5">
				<span class="text-[clamp(16px,2vw,20px)] font-medium text-fg-soft">{{ teamA }} x {{ teamB }}</span>
				<h2 class="text-[clamp(30px,4vw,48px)] leading-[1.1] font-bold text-white">
					Escaneie para acompanhar ao vivo
				</h2>
			</div>

			<div
				class="aspect-square w-[min(56vh,80vw,440px)] rounded-screen bg-white p-[18px] shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
			>
				<QrCode :text="url" :label="`QR code com o link do placar #${publicId}`" />
			</div>

			<div class="flex flex-col items-center gap-1">
				<span class="text-sm text-fg-soft">ou digite o ID na tela inicial</span>
				<span class="font-id text-[clamp(28px,4vw,44px)] font-semibold tracking-[4px] text-white">
					<span class="text-faint">#</span>{{ publicId }}
				</span>
			</div>
		</div>
	</Teleport>
</template>
