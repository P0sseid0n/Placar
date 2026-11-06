<script setup lang="ts">
import Services from '~/services'
import type { PlacarWithActivity } from '~/services/placar'

useHead({
	title: 'Placar',
})

const user = useSupabaseUser()
const toast = useToast()
const greetingName = computed(() => firstName(user.value?.user_metadata?.full_name as string | undefined))

// lazy: ao navegar dentro do app a página abre na hora e mostra o skeleton
const {
	data: placares,
	status,
	error,
	refresh,
} = useAsyncData('placares', () => Services.placar.getAll(), { lazy: true })

const createPlacarModal = ref(false)

const loading = computed(() => status.value === 'pending' && !placares.value)

// Os cards entram com animação só quando substituem o skeleton. No primeiro acesso, que já vem
// renderizado do servidor, animar faria o conteúdo piscar.
const animateEntry = ref(false)
watch(
	loading,
	isLoading => {
		if (isLoading && import.meta.client) animateEntry.value = true
	},
	{ immediate: true },
)
const failed = computed(() => status.value === 'error')
const list = computed(() => placares.value ?? [])

// Se a atualização falhar com a lista já na tela, a lista fica e um aviso explica
watch(error, err => {
	if (!err || !placares.value) return
	toast.add({
		color: 'error',
		title: 'Não foi possível atualizar seus placares',
		description: 'Mostrando a última lista carregada.',
		actions: [{ label: 'Tentar novamente', color: 'neutral', variant: 'subtle', onClick: () => refresh() }],
	})
})

const activityTime = (p: PlacarWithActivity) => new Date(p.last_activity).getTime()

// "Continuar de onde parou": o placar com a jogada mais recente (sem jogadas, conta a criação)
const latest = computed(() =>
	list.value.reduce<PlacarWithActivity | undefined>(
		(best, p) => (!best || activityTime(p) > activityTime(best) ? p : best),
		undefined,
	),
)

const searchInput = useTemplateRef('searchInput')
const search = ref('')
const query = computed(() => search.value.trim().toLowerCase().replace(/^#/, ''))
const searching = computed(() => query.value !== '')

// O card que sai fica posicionado onde estava enquanto some, para os outros deslizarem por baixo
function freezeLeaving(el: Element) {
	const node = el as HTMLElement
	const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = node
	Object.assign(node.style, {
		position: 'absolute',
		left: `${offsetLeft}px`,
		top: `${offsetTop}px`,
		width: `${offsetWidth}px`,
		height: `${offsetHeight}px`,
	})
}

function clearSearch() {
	search.value = ''
	searchInput.value?.focus()
}

type Order = 'recent' | 'oldest' | 'played'
const order = ref<Order>('recent')

const orderOptions: { value: Order; label: string }[] = [
	{ value: 'recent', label: 'Mais recentes' },
	{ value: 'oldest', label: 'Mais antigos' },
	{ value: 'played', label: 'Jogados por último' },
]

const filtered = computed(() => {
	const q = query.value
	// Sem busca, o destaque já aparece em cima: não repete na grade
	const matches = q
		? list.value.filter(
				p =>
					p.public_id.includes(q) ||
					p.team_a_name.toLowerCase().includes(q) ||
					p.team_b_name.toLowerCase().includes(q),
			)
		: list.value.filter(p => p.id !== latest.value?.id)

	// getAll já vem do mais recente para o mais antigo
	if (order.value === 'oldest') return [...matches].reverse()
	if (order.value === 'played') return [...matches].sort((a, b) => activityTime(b) - activityTime(a))
	return matches
})

// Mostra a grade aos poucos para listas longas
const PAGE_SIZE = 24
const visibleCount = ref(PAGE_SIZE)
watch([query, order], () => {
	visibleCount.value = PAGE_SIZE
})
const shown = computed(() => filtered.value.slice(0, visibleCount.value))
const hiddenCount = computed(() => filtered.value.length - shown.value.length)

// Com um placar só, o destaque basta; a busca aparece quando há o que buscar
const showList = computed(() => list.value.length > 1)

// Anunciado ao leitor de tela enquanto a pessoa digita
const searchAnnouncement = computed(() => {
	if (!searching.value) return ''
	const n = filtered.value.length
	if (n === 0) return 'Nenhum placar encontrado'
	return n === 1 ? '1 placar encontrado' : `${n} placares encontrados`
})
</script>

<template>
	<div class="min-h-dvh bg-canvas text-fg">
		<CreatePlacarModal v-model="createPlacarModal" />
		<PainelHeader />

		<main class="mx-auto flex max-w-7xl flex-col gap-10 px-[clamp(16px,5vw,64px)] pt-10 pb-20">
			<section class="flex flex-wrap items-end justify-between gap-5">
				<div class="flex flex-col gap-1.5">
					<p class="text-sm font-medium text-fg-soft">Seu painel</p>
					<h1 class="text-[clamp(30px,4vw,40px)] leading-[1.1] font-bold tracking-[-0.5px] text-white">
						{{ greetingName ? `Olá, ${greetingName}` : 'Olá!' }}
					</h1>
				</div>
				<UButton
					color="neutral"
					variant="solid"
					icon="i-lucide-plus"
					label="Criar placar"
					class="h-12 gap-2 rounded-field pr-5 pl-4 text-[15px] font-semibold hover:bg-fg"
					:ui="{ leadingIcon: 'size-5' }"
					@click="createPlacarModal = true"
				/>
			</section>

			<PainelCarregando v-if="loading" />

			<PainelErro v-else-if="failed && !placares" @retry="refresh()" />

			<PainelVazio v-else-if="!list.length" @create="createPlacarModal = true" />

			<template v-else>
				<Transition name="placar-enter" :appear="animateEntry">
					<section v-if="latest && !searching" aria-labelledby="ultimo" class="flex flex-col gap-3.5">
						<h2 id="ultimo" class="text-base font-semibold text-white">Continuar de onde parou</h2>
						<PlacarDestaque :placar="latest" />
					</section>
				</Transition>

				<section v-if="showList" aria-labelledby="todos" class="flex flex-col gap-4">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<h2 id="todos" class="text-base font-semibold text-white">
							{{ searching ? 'Resultados' : 'Outros placares' }}
							<span class="font-medium text-fg-soft">{{ filtered.length }}</span>
						</h2>

						<div class="flex flex-[0_1_440px] flex-wrap gap-2">
							<label for="busca" class="sr-only">Buscar placar</label>
							<div
								class="flex h-11 flex-[1_1_180px] items-center gap-2 rounded-btn bg-surface pr-1.5 pl-3 text-fg-soft ring-1 ring-fg-dim ring-inset focus-within:ring-fg-soft"
							>
								<UIcon name="i-lucide-search" class="size-4.5 shrink-0" aria-hidden="true" />
								<input
									id="busca"
									ref="searchInput"
									v-model="search"
									type="search"
									placeholder="Buscar por time ou ID"
									autocomplete="off"
									spellcheck="false"
									class="h-full min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-fg-soft focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
								/>
								<button
									v-if="search"
									type="button"
									aria-label="Limpar busca"
									class="flex size-8 shrink-0 items-center justify-center rounded-chip text-fg-soft hover:bg-raised hover:text-white"
									@click="clearSearch"
								>
									<UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
								</button>
							</div>

							<USelect
								v-model="order"
								:items="orderOptions"
								aria-label="Ordenar"
								color="neutral"
								variant="none"
								class="h-11 w-44 shrink-0 rounded-btn bg-surface text-sm text-fg ring-1 ring-fg-dim ring-inset data-[state=open]:ring-fg-soft"
								:ui="{
									trailingIcon: 'text-fg-soft',
									content: 'bg-surface rounded-btn ring-edge',
									item: 'text-fg',
								}"
							/>
						</div>
					</div>

					<p class="sr-only" aria-live="polite">{{ searchAnnouncement }}</p>

					<div
						v-if="searching && !filtered.length"
						class="flex flex-col items-center gap-3 rounded-card px-6 py-10 text-center ring-1 ring-raised ring-inset"
					>
						<UIcon name="i-lucide-search-x" class="size-7 text-fg-soft" aria-hidden="true" />
						<div class="flex flex-col gap-1">
							<p class="text-[15px] font-semibold text-white">
								Nenhum placar encontrado para “{{ search.trim() }}”
							</p>
							<p class="text-sm text-fg-soft">Confira o nome do time ou o ID de 6 caracteres.</p>
						</div>
						<UButton
							color="neutral"
							variant="subtle"
							icon="i-lucide-x"
							label="Limpar busca"
							class="mt-1 h-11 gap-2 rounded-field bg-raised px-4 text-sm font-semibold text-white ring-edge hover:bg-edge"
							@click="clearSearch"
						/>
					</div>

					<!-- Ao buscar ou reordenar, os cards deslizam até o novo lugar; os que saem somem -->
					<TransitionGroup
						v-else
						tag="ul"
						name="placar-list"
						:appear="animateEntry"
						class="relative grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4"
						@before-leave="freezeLeaving"
					>
						<li v-for="(placar, index) in shown" :key="placar.id" :style="{ '--i': index }">
							<PlacarItem :placar="placar" />
						</li>
					</TransitionGroup>

					<UButton
						v-if="hiddenCount > 0"
						color="neutral"
						variant="subtle"
						:label="`Mostrar mais ${Math.min(hiddenCount, PAGE_SIZE)} de ${hiddenCount}`"
						class="h-11 self-center rounded-field bg-raised px-5 text-sm font-semibold text-white ring-edge hover:bg-edge"
						@click="visibleCount += PAGE_SIZE"
					/>
				</section>
			</template>
		</main>
	</div>
</template>

<style scoped>
/* Entrada (destaque e cards): sobe 8px e aparece; os cards em cascata de 40 ms, até o 6º */
.placar-enter-enter-active,
.placar-enter-appear-active,
.placar-list-enter-active,
.placar-list-appear-active {
	transition:
		opacity 260ms ease-out,
		transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.placar-list-enter-active,
.placar-list-appear-active {
	transition-delay: calc(min(var(--i, 0), 6) * 40ms);
}

.placar-enter-enter-from,
.placar-enter-appear-from,
.placar-list-enter-from,
.placar-list-appear-from {
	opacity: 0;
	transform: translateY(8px);
}

/* Saída: some rápido, encolhendo um pouco */
.placar-enter-leave-active,
.placar-list-leave-active {
	transition:
		opacity 160ms ease-in,
		transform 160ms ease-in;
}

.placar-enter-leave-to,
.placar-list-leave-to {
	opacity: 0;
	transform: scale(0.96);
}

/* Reordenar: os cards deslizam até a nova posição */
.placar-list-move {
	transition: transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
	.placar-enter-enter-active,
	.placar-enter-appear-active,
	.placar-enter-leave-active,
	.placar-list-enter-active,
	.placar-list-appear-active,
	.placar-list-leave-active,
	.placar-list-move {
		transition: none;
	}
}
</style>
