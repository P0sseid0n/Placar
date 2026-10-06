<script setup lang="ts">
// Compartilhar placar (docs/placar-design/COMPARTILHAR.md): QR code, ID, link, baixar QR e tela cheia
const model = defineModel<boolean>()
const { publicId, teamA, teamB } = defineProps<{
	publicId: string
	teamA: string
	teamB: string
}>()

const toast = useToast()
const url = computed(() => placarUrl(useRequestURL().origin, publicId))

const full = ref(false)
const fullButton = ref<{ $el: HTMLElement } | null>(null)
let returningFromFull = false

async function copy(text: string, title: string) {
	try {
		await navigator.clipboard.writeText(text)
		toast.add({ color: 'success', title })
	} catch {
		toast.add({ color: 'error', title: 'Não foi possível copiar', description: 'Copie pelo campo de link.' })
	}
}

function download() {
	const link = document.createElement('a')
	link.href = qrPngDataUrl(qrMatrix(url.value))
	link.download = `placar-${publicId}.png`
	link.click()
	toast.add({ color: 'success', title: 'QR code baixado' })
}

// A tela cheia substitui o modal; ao sair dela, o modal volta com o foco no botão que a abriu
function openFull() {
	model.value = false
	full.value = true
}

function closeFull() {
	full.value = false
	returningFromFull = true
	model.value = true
}

// Ao voltar da tela cheia, o foco vai para "Mostrar em tela cheia" depois que o modal termina de abrir
function onAfterEnter() {
	if (!returningFromFull) return
	returningFromFull = false
	fullButton.value?.$el.focus()
}
</script>

<template>
	<UModal
		v-model:open="model"
		title="Compartilhar placar"
		description="Quem abrir acompanha ao vivo, sem precisar entrar."
		:ui="{ content: 'max-w-[480px] max-h-[calc(100dvh-48px)] overflow-hidden sm:max-h-[calc(100dvh-48px)]' }"
		@after:enter="onAfterEnter"
	>
		<template #content="{ close }">
			<div class="flex min-h-0 flex-1 flex-col">
				<div class="flex shrink-0 items-start justify-between gap-4 border-b border-raised px-6 pt-5.5 pb-4.5">
					<div class="flex min-w-0 flex-col gap-1">
						<h2 class="text-[22px] leading-7.5 font-bold text-white">Compartilhar placar</h2>
						<span class="text-sm text-fg-soft">Quem abrir acompanha ao vivo, sem precisar entrar.</span>
					</div>
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-lucide-x"
						aria-label="Fechar"
						class="size-10 shrink-0 justify-center rounded-btn text-fg-soft hover:bg-raised hover:text-white"
						:ui="{ leadingIcon: 'size-5' }"
						@click="close"
					/>
				</div>

				<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-6">
					<div class="flex flex-col items-center gap-3">
						<div class="size-54 rounded-feature bg-white p-2.5">
							<QrCode :text="url" :label="`QR code com o link do placar #${publicId}`" />
						</div>
						<span class="inline-flex items-center gap-1.5 text-[13px] text-fg-soft">
							<UIcon name="i-lucide-smartphone" class="size-4" aria-hidden="true" />
							Aponte a câmera do celular para abrir
						</span>
					</div>

					<div
						class="flex flex-wrap items-center justify-between gap-3 rounded-card bg-canvas px-4 py-3.5 ring-1 ring-raised ring-inset"
					>
						<div class="flex flex-col gap-0.5">
							<span class="text-xs font-semibold text-fg-soft">ID do placar</span>
							<span class="font-id text-[22px] font-semibold tracking-[2px] text-white">
								<span class="text-faint">#</span>{{ publicId }}
							</span>
						</div>
						<UButton
							color="neutral"
							variant="subtle"
							icon="i-lucide-copy"
							label="Copiar ID"
							class="h-11 gap-2 rounded-field bg-raised px-3.5 text-sm font-semibold text-white ring-edge hover:bg-edge"
							:ui="{ leadingIcon: 'size-4' }"
							@click="copy(publicId, 'ID copiado!')"
						/>
					</div>

					<div class="flex flex-col gap-2">
						<label for="share-link" class="text-[13px] font-semibold text-white">Link</label>
						<div class="flex gap-2">
							<input
								id="share-link"
								type="text"
								readonly
								:value="url"
								class="h-12 min-w-0 flex-1 rounded-field bg-canvas px-3.5 font-id text-sm text-fg-strong ring-1 ring-edge ring-inset focus:ring-fg-soft focus:outline-none"
								@focus="($event.target as HTMLInputElement).select()"
							/>
							<UButton
								color="neutral"
								variant="solid"
								icon="i-lucide-link"
								label="Copiar link"
								class="h-12 shrink-0 gap-2 rounded-field px-4 text-sm font-semibold hover:bg-fg"
								:ui="{ leadingIcon: 'size-4' }"
								@click="copy(url, 'Link copiado!')"
							/>
						</div>
					</div>

					<div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
						<UButton
							color="neutral"
							variant="subtle"
							icon="i-lucide-download"
							label="Baixar QR code"
							class="h-12 justify-center gap-2 rounded-field bg-raised text-sm font-semibold text-fg ring-edge hover:bg-edge"
							:ui="{ leadingIcon: 'size-[17px]' }"
							@click="download"
						/>
						<UButton
							ref="fullButton"
							color="neutral"
							variant="subtle"
							icon="i-lucide-scan"
							label="Mostrar em tela cheia"
							class="h-12 justify-center gap-2 rounded-field bg-raised text-sm font-semibold text-fg ring-edge hover:bg-edge"
							:ui="{ leadingIcon: 'size-[17px]' }"
							@click="openFull"
						/>
					</div>
				</div>

				<div class="flex shrink-0 justify-end border-t border-raised bg-canvas px-6 py-3.5">
					<UButton
						color="neutral"
						variant="subtle"
						label="Fechar"
						class="h-12 rounded-field bg-raised px-5 text-[15px] font-semibold text-white ring-edge hover:bg-edge"
						@click="close"
					/>
				</div>
			</div>
		</template>
	</UModal>

	<ShareFullscreen v-if="full" :url="url" :public-id="publicId" :team-a="teamA" :team-b="teamB" @close="closeFull" />
</template>
