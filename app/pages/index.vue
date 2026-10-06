<script setup lang="ts">
useHead({
	title: 'Placar | Login',
})

const client = useSupabaseClient()
const user = useSupabaseUser()

watchEffect(() => {
	if (user.value) {
		navigateTo('/painel')
	}
})

const signingIn = ref(false)

async function signInWithDiscord() {
	signingIn.value = true

	const { error } = await client.auth.signInWithOAuth({ provider: 'discord' })

	// Em caso de sucesso o navegador sai da página; só volta aqui se der erro
	if (error) {
		signingIn.value = false
		useToast().add({ color: 'error', title: 'Não foi possível entrar com o Discord', description: 'Tente novamente.' })
	}
}

const placarId = ref('')
const tried = ref(false)

const isComplete = computed(() => isValidPlacarId(placarId.value))
const showError = computed(() => tried.value && !isComplete.value)

const message = computed(() => {
	if (!showError.value) return 'Peça o ID para quem criou o placar.'
	return placarId.value.length === 0 ? 'Digite o ID do placar.' : 'O ID tem 6 letras ou números.'
})

function onIdInput(event: Event) {
	const input = event.target as HTMLInputElement
	placarId.value = sanitizePlacarId(input.value)
	// Mantém o campo igual ao valor limpo mesmo quando a limpeza não muda o ref
	input.value = placarId.value
	tried.value = false
}

function goToPlacar() {
	tried.value = true
	if (isComplete.value) navigateTo(`/id/${placarId.value}`)
}

const highlights = [
	{ icon: 'i-lucide-plus', text: 'Pontos com um clique' },
	{ icon: 'i-lucide-link', text: 'Compartilhe por ID ou link' },
	{ icon: 'i-lucide-monitor', text: 'Modo telão para a TV' },
]
</script>

<template>
	<main class="flex min-h-screen items-center justify-center bg-canvas bg-dots p-4 py-12 sm:p-12">
		<div class="flex w-full max-w-[1180px] flex-wrap items-center justify-center gap-[clamp(40px,6vw,96px)]">
			<section class="flex min-w-0 max-w-[600px] flex-[1_1_480px] flex-col gap-8">
				<div class="flex flex-col gap-1">
					<p class="text-lg font-medium text-fg/75">Bem-vindo(a) ao</p>
					<AppLogo tag="h1" fluid class="text-[clamp(64px,10vw,112px)] tracking-[-2px]" />
					<p class="mt-3 max-w-[460px] text-lg text-fg-strong">
						Crie o placar do seu jogo em segundos e compartilhe com todo mundo por um ID.
					</p>
				</div>

				<LoginPreview class="max-[900px]:hidden" />

				<ul class="flex flex-wrap gap-x-6 gap-y-2.5">
					<li v-for="item in highlights" :key="item.text" class="flex items-center gap-2 text-sm text-fg-strong">
						<UIcon :name="item.icon" class="size-[18px] text-fg-soft" aria-hidden="true" />
						{{ item.text }}
					</li>
				</ul>
			</section>

			<section
				aria-labelledby="entrar"
				class="flex min-w-0 flex-[0_1_420px] flex-col rounded-panel bg-surface p-[clamp(24px,3vw,36px)] shadow-[inset_0_0_0_1px_var(--color-raised),0_24px_60px_rgba(0,0,0,0.35)]"
			>
				<h2 id="entrar" class="text-2xl font-bold text-white">Entrar</h2>
				<p class="mt-1.5 mb-6 text-[15px] leading-[22px] text-fg-soft">Entre para criar e controlar seus placares.</p>

				<UButton
					color="neutral"
					variant="solid"
					block
					icon="i-simple-icons-discord"
					label="Entrar com Discord"
					:loading="signingIn"
					class="h-[52px] gap-2.5 rounded-field text-base font-semibold hover:bg-fg"
					@click="signInWithDiscord"
				/>

				<div role="separator" class="my-7 flex items-center gap-3">
					<span class="h-px flex-1 bg-raised" />
					<span class="text-[13px] font-medium text-fg-soft">ou assista a um placar</span>
					<span class="h-px flex-1 bg-raised" />
				</div>

				<form class="flex flex-col gap-2" novalidate @submit.prevent="goToPlacar">
					<label for="placar-id" class="text-sm font-semibold text-white">ID do placar</label>
					<div
						class="flex h-[52px] items-center gap-1.5 rounded-field bg-canvas py-1.5 pr-1.5 pl-3.5 ring-1 ring-inset transition-shadow"
						:class="showError ? 'ring-error' : 'ring-edge focus-within:ring-fg-soft'"
					>
						<span aria-hidden="true" class="font-id text-[17px] text-faint">#</span>
						<input
							id="placar-id"
							:value="placarId"
							type="text"
							inputmode="text"
							maxlength="6"
							autocomplete="off"
							autocapitalize="off"
							spellcheck="false"
							placeholder="k3x9a2"
							aria-describedby="placar-id-msg"
							:aria-invalid="showError"
							class="h-full min-w-0 flex-1 bg-transparent font-id text-[17px] tracking-[2px] text-white placeholder:text-fg-dim focus:outline-none"
							@input="onIdInput"
						/>
						<span class="text-xs text-fg-dim tabular-nums">{{ placarId.length }}/6</span>
						<button
							type="submit"
							aria-label="Abrir placar"
							class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-btn transition-colors"
							:class="isComplete ? 'bg-white text-canvas hover:bg-fg' : 'bg-raised text-fg-soft hover:bg-edge'"
						>
							<UIcon name="i-lucide-arrow-right" class="size-5" />
						</button>
					</div>
					<p
						id="placar-id-msg"
						role="status"
						class="min-h-5 text-[13px] leading-5"
						:class="showError ? 'text-error' : 'text-fg-soft'"
					>
						{{ message }}
					</p>
				</form>
			</section>
		</div>
	</main>
</template>
