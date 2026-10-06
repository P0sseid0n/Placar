<script setup lang="ts">
import Services from '~/services'
import type { Database } from '~/types/database.types'

// Modal de perfil (docs/placar-design/PERFIL.md): abas Perfil e Configurações.
const model = defineModel<boolean>()

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()

const fullName = computed(() => (user.value?.user_metadata?.full_name as string | undefined) ?? '')

type Tab = 'perfil' | 'config'
const TABS: { id: Tab; label: string }[] = [
	{ id: 'perfil', label: 'Perfil' },
	{ id: 'config', label: 'Configurações' },
]
const tab = ref<Tab>('perfil')

// Setas do teclado trocam de aba (padrão de abas do WAI-ARIA)
function onTabKeydown(event: KeyboardEvent) {
	if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
	event.preventDefault()
	const index = TABS.findIndex(t => t.id === tab.value)
	const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]!
	tab.value = next.id
	document.getElementById(`perfil-tab-${next.id}`)?.focus()
}

// Os números usam os placares que o /painel já carregou; se não houver, busca
const { data: cachedPlacares } = useNuxtData<Awaited<ReturnType<typeof Services.placar.getAll>>>('placares')
const fetchedPlacares = ref<typeof cachedPlacares.value>(null)
const placares = computed(() => cachedPlacares.value ?? fetchedPlacares.value ?? [])
const stats = computed(() => profileStats(placares.value))

// A data de criação da conta não vem no token da sessão; busca o usuário completo
const organizerSinceText = ref('')

watch(model, async open => {
	if (!open) return
	tab.value = 'perfil'

	if (!cachedPlacares.value && !fetchedPlacares.value) {
		fetchedPlacares.value = await Services.placar.getAll().catch(() => null)
	}
	if (!organizerSinceText.value) {
		const { data } = await client.auth.getUser()
		if (data.user?.created_at) organizerSinceText.value = organizerSince(data.user.created_at)
	}
})

const signingOut = ref(false)

async function signOut() {
	signingOut.value = true
	await client.auth.signOut()
	signingOut.value = false
	model.value = false
	await navigateTo('/')
}

// Excluir conta: o primeiro clique pede confirmação no próprio bloco
const toast = useToast()
const deleteStep = ref<'idle' | 'confirm' | 'deleting'>('idle')

const deleteText = computed(() => {
	if (deleteStep.value === 'idle') return 'Apaga sua conta e todos os seus placares. Não dá para desfazer.'
	const n = stats.value.total
	return `Tem certeza? ${n === 1 ? 'Seu placar será apagado' : `Seus ${n} placares serão apagados`} junto com a conta.`
})

async function deleteAccount() {
	deleteStep.value = 'deleting'
	try {
		await Services.account.deleteAccount()
	} catch (error) {
		console.error(error)
		deleteStep.value = 'confirm'
		toast.add({ color: 'error', title: 'Não foi possível excluir a conta', description: 'Tente novamente.' })
		return
	}

	// A conta já não existe no servidor; só limpa a sessão deste navegador
	await client.auth.signOut({ scope: 'local' }).catch(() => {})
	model.value = false
	toast.add({ color: 'success', title: 'Conta excluída' })
	await navigateTo('/')
}

// Ao fechar o modal ou trocar de aba, a confirmação volta ao início
watch([model, tab], () => {
	if (deleteStep.value !== 'deleting') deleteStep.value = 'idle'
})

// O usuário é organizador (cria placares, não joga): nada de estatísticas de pontos
const infoItems = computed(() => [
	{ label: 'Placares criados', value: String(stats.value.total), number: true },
	{
		label: 'Último placar criado',
		value: stats.value.lastCreatedAt ? relativeTime(stats.value.lastCreatedAt) : '—',
		number: false,
	},
	{ label: 'Organizador desde', value: organizerSinceText.value || '—', number: false },
])
</script>

<template>
	<UModal
		v-model:open="model"
		:title="fullName ? `Perfil de ${fullName}` : 'Perfil'"
		description="Seus números e as configurações da conta."
		:ui="{ content: 'max-w-[560px] max-h-[calc(100dvh-48px)] overflow-hidden sm:max-h-[calc(100dvh-48px)]' }"
	>
		<template #content="{ close }">
			<div class="flex min-h-0 flex-1 flex-col">
				<!-- Topo (fixo) -->
				<div class="shrink-0">
					<div
						class="relative h-20 border-b border-raised bg-canvas bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[16px_16px]"
					>
						<div aria-hidden="true" class="absolute inset-x-0 bottom-0 flex h-1">
							<span class="flex-1 bg-[#51a2ff]" />
							<span class="flex-1 bg-[#ff8904]" />
						</div>
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-lucide-x"
							aria-label="Fechar"
							class="absolute top-3 right-3 size-10 justify-center rounded-btn text-fg-soft hover:bg-raised hover:text-white"
							:ui="{ leadingIcon: 'size-5' }"
							@click="close"
						/>
					</div>

					<div class="relative z-10 flex items-start gap-4 px-7 max-sm:px-5">
						<UserAvatar :size="76" class="-mt-9.5 shadow-[0_0_0_5px_var(--color-surface)]" />
						<div class="flex min-w-0 flex-col pt-2.5">
							<h2 class="truncate text-[22px] leading-7.5 font-bold text-white">{{ fullName }}</h2>
							<span class="inline-flex items-center gap-1.5 text-[13px] text-fg-soft">
								<UIcon name="i-simple-icons-discord" class="size-3.5" aria-hidden="true" />
								Conectado com Discord
							</span>
						</div>
					</div>

					<div
						role="tablist"
						aria-label="Seções do perfil"
						class="mt-4.5 flex gap-1 border-b border-raised px-7 max-sm:px-5"
						@keydown="onTabKeydown"
					>
						<button
							v-for="item in TABS"
							:id="`perfil-tab-${item.id}`"
							:key="item.id"
							type="button"
							role="tab"
							:aria-selected="tab === item.id"
							:aria-controls="`perfil-painel-${item.id}`"
							:tabindex="tab === item.id ? 0 : -1"
							class="relative h-12 cursor-pointer px-3.5 text-sm font-semibold transition-colors"
							:class="tab === item.id ? 'text-white' : 'text-fg-soft hover:text-white'"
							@click="tab = item.id"
						>
							{{ item.label }}
							<span
								aria-hidden="true"
								class="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full"
								:class="tab === item.id ? 'bg-white' : 'bg-transparent'"
							/>
						</button>
					</div>
				</div>

				<!-- Meio (só ele rola) -->
				<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
					<div
						v-if="tab === 'perfil'"
						id="perfil-painel-perfil"
						role="tabpanel"
						aria-labelledby="perfil-tab-perfil"
						class="flex flex-col gap-6 px-7 py-6 max-sm:px-5"
					>
						<div class="grid grid-cols-3 gap-2.5">
							<div
								v-for="item in infoItems"
								:key="item.label"
								class="flex min-w-0 flex-col gap-0.5 rounded-card bg-canvas px-4 py-3.5 ring-1 ring-raised ring-inset"
							>
								<span
									class="font-bold text-white"
									:class="
										item.number
											? 'font-score text-[34px] leading-none'
											: 'truncate text-[17px] leading-8.5'
									"
								>
									{{ item.value }}
								</span>
								<span class="text-xs font-medium text-fg-soft">{{ item.label }}</span>
							</div>
						</div>
						<p class="text-[13px] leading-5 text-fg-dim">Nome e foto vêm da sua conta do Discord.</p>
					</div>

					<div
						v-else
						id="perfil-painel-config"
						role="tabpanel"
						aria-labelledby="perfil-tab-config"
						class="flex flex-col gap-6 px-7 py-6 max-sm:px-5"
					>
						<section aria-labelledby="perfil-conta" class="flex flex-col gap-3">
							<h3 id="perfil-conta" class="text-[15px] font-semibold text-white">Conta</h3>
							<div class="flex flex-wrap items-center justify-between gap-3">
								<span class="text-[13px] text-fg-soft"
									>Você pode entrar de novo a qualquer momento.</span
								>
								<UButton
									color="neutral"
									variant="subtle"
									icon="i-lucide-log-out"
									label="Sair da conta"
									:loading="signingOut"
									class="h-11 gap-2 rounded-field bg-raised px-3.5 text-sm font-semibold text-fg ring-edge hover:bg-edge"
									@click="signOut"
								/>
							</div>

							<div
								class="flex flex-wrap items-center justify-between gap-3 rounded-card bg-error/5 p-4 ring-1 ring-error/30 ring-inset"
							>
								<div class="flex flex-[1_1_220px] flex-col gap-0.5">
									<span class="text-sm font-semibold text-error">Excluir conta</span>
									<span role="status" class="text-[13px] leading-4.75 text-fg-soft">{{
										deleteText
									}}</span>
								</div>

								<div v-if="deleteStep !== 'idle'" class="flex items-center gap-1.5">
									<UButton
										color="neutral"
										variant="ghost"
										label="Cancelar"
										:disabled="deleteStep === 'deleting'"
										class="h-11 rounded-field px-3 text-sm font-semibold text-fg-strong hover:bg-raised hover:text-white"
										@click="deleteStep = 'idle'"
									/>
									<UButton
										color="error"
										variant="solid"
										label="Sim, excluir"
										:loading="deleteStep === 'deleting'"
										class="h-11 rounded-field bg-error px-3.5 text-sm font-bold text-canvas hover:bg-[#ff8183]"
										@click="deleteAccount"
									/>
								</div>
								<UButton
									v-else
									color="error"
									variant="ghost"
									icon="i-lucide-trash-2"
									label="Excluir"
									class="h-11 gap-2 rounded-field px-3.5 text-sm font-semibold text-error ring-1 ring-error/40 ring-inset hover:bg-error/12"
									@click="deleteStep = 'confirm'"
								/>
							</div>
						</section>
					</div>
				</div>

				<!-- Rodapé (fixo) -->
				<div class="flex shrink-0 justify-end border-t border-raised bg-canvas px-7 py-3.5 max-sm:px-5">
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
</template>
