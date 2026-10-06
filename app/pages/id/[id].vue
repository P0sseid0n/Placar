<script setup lang="ts">
import Services from '~/services'
import type { PlacarSettings } from '~/services/placar'

const route = useRoute()
const user = useSupabaseUser()
const toast = useToast()

const placarPublicId = String(route.params.id ?? '')

const { data: placar, error } = await useAsyncData(`placar-${placarPublicId}`, async () => {
	if (!isValidPlacarId(placarPublicId)) {
		throw createError({ statusCode: 400, message: 'ID inválido' })
	}

	const placarPayload = await Services.placar.getById(placarPublicId)
	if (!placarPayload) {
		// O marcador diferencia "placar não existe" de "rota não existe" no error.vue
		throw createError({ statusCode: 404, message: 'Placar não encontrado', data: { reason: PLACAR_NOT_FOUND } })
	}
	return placarPayload
})

// Erros do useAsyncData não abrem a página de erro sozinhos; sem isso a tela ficava no spinner
if (error.value) {
	throw createError({
		statusCode: error.value.statusCode ?? 500,
		message: error.value.message,
		data: error.value.data,
		fatal: true,
	})
}

useHead({
	title: () => (placar.value ? `Placar | ${placar.value.team_a_name} x ${placar.value.team_b_name}` : 'Placar'),
})

const isOwner = computed(() => !!user.value && user.value.sub === placar.value?.creator)

// ------------------------------------------------------------
// Placar na tela
// ------------------------------------------------------------

const summary = computed(() => scoreSummary(placar.value!))
const looks = computed(() => ({ a: teamLookFor(placar.value!, 'a'), b: teamLookFor(placar.value!, 'b') }))

const teams = computed(() =>
	(['a', 'b'] as const).map(team => ({
		team,
		name: team === 'a' ? placar.value!.team_a_name : placar.value!.team_b_name,
		look: looks.value[team],
		score: summary.value[team],
		status: (summary.value.tie ? 'tie' : summary.value.leader === team ? 'leader' : 'trailing') as
			'leader' | 'trailing' | 'tie',
	})),
)

// O data do useAsyncData é um shallowRef no Nuxt 4: alterar um campo não atualiza a tela,
// então as mudanças substituem o objeto inteiro
function patchPlacar(changes: Partial<NonNullable<typeof placar.value>>) {
	if (placar.value) placar.value = { ...placar.value, ...changes }
}

// "há X min" se atualiza sozinho
const now = ref(new Date())
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => (clock = setInterval(() => (now.value = new Date()), 30_000)))
onBeforeUnmount(() => clearInterval(clock))

// ------------------------------------------------------------
// Últimas jogadas
// ------------------------------------------------------------

const { data: events, refresh: refreshEvents } = await useAsyncData(
	`jogadas-${placarPublicId}`,
	() => Services.placar.getEvents(placar.value!.id, 6),
	{ default: () => [] },
)

const eventChips = computed(() =>
	events.value.map((event, index) => ({
		id: event.id,
		team: event.team === 'a' ? placar.value!.team_a_name : placar.value!.team_b_name,
		look: looks.value[event.team === 'a' ? 'a' : 'b'],
		delta: formatDelta(event.delta),
		positive: event.delta > 0,
		after: event.score_after,
		when: relativeTime(event.created_at, now.value),
		faded: index > 0,
	})),
)

const lastEvent = computed(() => eventChips.value[0])

// ------------------------------------------------------------
// Pontuar e desfazer (dono)
// ------------------------------------------------------------

// Os cliques são salvos em fila para chegarem ao banco na ordem em que foram dados
// (a soma em si é atômica no banco, em placar_add_points).
let saveQueue = Promise.resolve()
let pendingSaves = 0

function handleUpdateScore(team: 'a' | 'b', action: 'increment' | 'decrement') {
	if (!placar.value) return

	const column = `team_${team}_score` as const
	const current = placar.value[column] ?? 0
	const delta = action === 'increment' ? placar.value.score_increment : -placar.value.score_increment
	const optimistic = Math.max(0, current + delta)

	if (optimistic === current) return

	// Atualização otimista: o número muda na hora
	patchPlacar({ [column]: optimistic })
	pendingSaves++

	saveQueue = saveQueue.then(async () => {
		const saved = await Services.placar.updateTeamScore(placarPublicId, team, action)
		pendingSaves--

		if (saved === null) {
			toast.add({
				color: 'error',
				title: 'Não foi possível salvar o ponto',
				description: 'O placar foi recarregado.',
			})
			await Promise.all([refreshNuxtData(`placar-${placarPublicId}`), refreshEvents()])
			return
		}

		// Só aplica o valor do banco quando não há outros cliques na fila, para o número não "voltar"
		if (pendingSaves === 0) {
			patchPlacar({ [column]: saved })
			refreshEvents()
		}
	})
}

const undoing = ref(false)

function handleUndo() {
	undoing.value = true

	// Entra na mesma fila dos cliques, para desfazer depois que eles forem salvos
	saveQueue = saveQueue.then(async () => {
		try {
			const undone = await Services.placar.undoLast(placarPublicId)
			if (undone) patchPlacar({ [`team_${undone.team}_score`]: undone.score })
			await refreshEvents()
		} catch (error) {
			console.error(error)
			toast.add({ color: 'error', title: 'Não foi possível desfazer', description: 'Tente novamente.' })
		} finally {
			undoing.value = false
		}
	})
}

// ------------------------------------------------------------
// Realtime: o placar muda em outro aparelho
// ------------------------------------------------------------

// Animação ao marcar ponto: dispara só quando chega uma jogada nova (INSERT em PlacarEvent),
// tanto para o dono quanto para o visitante. Reiniciar e desfazer só atualizam o número.
const { animations, play } = useScoreAnimation(looks)

const { connected } = usePlacarRealtime(placar, {
	onUpdate(row) {
		if (!placar.value) return
		placar.value = mergeRealtimePlacar(placar.value, row, pendingSaves)
		if (pendingSaves === 0) refreshEvents()
	},
	onDelete() {
		// O dono que apagou já foi para o painel; para quem está assistindo, o placar deixou de existir
		if (isOwner.value) return
		showError({ statusCode: 404, message: 'Placar não encontrado', data: { reason: PLACAR_NOT_FOUND } })
	},
	onEvent(event) {
		if (event.team === 'a' || event.team === 'b') play(event.team, event.delta)
		refreshEvents()
	},
})

// ------------------------------------------------------------
// Copiar ID e link
// ------------------------------------------------------------

async function copy(text: string, title: string, description: string) {
	try {
		await navigator.clipboard.writeText(text)
		toast.add({ color: 'success', title, description })
	} catch {
		toast.add({ color: 'error', title: 'Não foi possível copiar', description: 'Copie pela barra de endereço.' })
	}
}

const copyId = () => copy(placarPublicId, 'ID copiado!', 'Quem tiver o ID pode ver o placar.')
const copyLink = () =>
	copy(`${window.location.origin}/id/${placarPublicId}`, 'Link copiado!', 'Quem abrir o link acompanha ao vivo.')

// ------------------------------------------------------------
// Modo telão (visitante)
// ------------------------------------------------------------

const telao = ref(false)

async function enterTelao() {
	telao.value = true
	try {
		await document.documentElement.requestFullscreen?.()
	} catch {
		// Sem permissão de tela cheia: o modo telão continua só com o layout
	}
}

async function exitTelao() {
	telao.value = false
	if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
}

// Sair da tela cheia pelo Esc também sai do modo telão
function onFullscreenChange() {
	if (!document.fullscreenElement) telao.value = false
}
onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFullscreenChange))

// ------------------------------------------------------------
// Configurações
// ------------------------------------------------------------

const configModal = ref(false)

function handleSaved(settings: PlacarSettings) {
	patchPlacar({
		team_a_name: settings.teamA,
		team_b_name: settings.teamB,
		score_increment: settings.score,
		score_size: settings.scoreSize,
	})
}

function handleReset() {
	patchPlacar({ team_a_score: 0, team_b_score: 0 })
	events.value = []
}

function handleDeleted() {
	navigateTo('/painel')
}
</script>

<template>
	<div v-if="placar" class="relative flex min-h-screen flex-col bg-canvas text-fg">
		<PlacarHeader
			v-if="!telao"
			:is-owner="isOwner"
			:live="connected"
			@share="copyLink"
			@settings="configModal = true"
			@telao="enterTelao"
		/>

		<UButton
			v-else
			color="neutral"
			variant="ghost"
			icon="i-lucide-minimize"
			aria-label="Sair do modo telão"
			class="absolute top-4 right-4 z-10 size-11 justify-center rounded-btn text-fg-dim hover:bg-raised hover:text-white"
			:ui="{ leadingIcon: 'size-5' }"
			@click="exitTelao"
		/>

		<div
			class="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6"
			:class="
				telao
					? 'px-[clamp(16px,3vw,40px)] py-6'
					: isOwner
						? 'px-[clamp(16px,4vw,48px)] pt-7 pb-12'
						: 'px-[clamp(16px,4vw,48px)] pt-7 pb-10'
			"
		>
			<!-- Chips -->
			<div v-if="!telao" class="flex flex-wrap items-center justify-center gap-2">
				<button
					type="button"
					:aria-label="`Copiar ID do placar ${placar.public_id}`"
					class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 font-id text-sm text-fg ring-1 ring-raised transition-colors ring-inset hover:bg-raised hover:text-white"
					@click="copyId"
				>
					<span><span class="text-fg-dim">#</span>{{ placar.public_id }}</span>
					<UIcon name="i-lucide-copy" class="size-[15px] opacity-60" aria-hidden="true" />
				</button>

				<template v-if="isOwner">
					<span
						class="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-fg-soft ring-1 ring-raised ring-inset"
					>
						<strong class="font-bold text-white">+{{ placar.score_increment }}</strong> por clique
					</span>
					<span
						class="inline-flex h-9 items-center rounded-full px-3 text-[13px] text-fg-soft ring-1 ring-raised ring-inset max-[720px]:hidden"
					>
						Criado {{ relativeTime(placar.created_at, now) }}
					</span>
				</template>
				<span
					v-else
					class="inline-flex h-9 items-center rounded-full px-3 text-[13px] text-fg-soft ring-1 ring-raised ring-inset"
				>
					Você está assistindo
				</span>
			</div>

			<!-- Times -->
			<main class="flex flex-wrap items-stretch justify-center gap-5" :class="!isOwner && 'flex-1'">
				<template v-for="(team, index) in teams" :key="team.team">
					<div
						v-if="index === 1"
						aria-hidden="true"
						class="flex shrink-0 flex-col items-center gap-2.5 self-center py-2"
					>
						<span
							class="flex size-14 items-center justify-center rounded-full font-score text-[22px] font-bold text-fg-soft ring-1 ring-edge ring-inset"
							:class="isOwner && 'bg-canvas'"
						>
							VS
						</span>
						<span class="text-center text-xs leading-4 font-semibold text-fg-dim">
							<template v-for="(line, i) in diffLines(summary.a, summary.b)" :key="i">
								<br v-if="i > 0" />{{ line }}
							</template>
						</span>
					</div>

					<TeamPanel
						:name="team.name"
						:look="team.look"
						:score="team.score"
						:increment="placar.score_increment"
						:score-size="placar.score_size"
						:variant="isOwner ? 'owner' : 'viewer'"
						:status="team.status"
						:behind="summary.diff"
						:animation="animations[team.team]"
						@plus="handleUpdateScore(team.team, 'increment')"
						@minus="handleUpdateScore(team.team, 'decrement')"
					/>
				</template>
			</main>

			<!-- Últimas jogadas (dono) -->
			<section
				v-if="isOwner"
				aria-labelledby="jogadas"
				class="flex flex-col gap-2 rounded-feature bg-surface px-5 py-4 ring-1 ring-raised ring-inset"
			>
				<div class="flex items-center justify-between gap-3">
					<h2 id="jogadas" class="text-sm font-semibold text-white">Últimas jogadas</h2>
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-lucide-undo-2"
						label="Desfazer"
						:disabled="!events.length"
						:loading="undoing"
						class="h-10 gap-1.5 rounded-btn px-3 text-[13px] font-semibold text-fg-strong hover:bg-raised hover:text-white"
						:ui="{ leadingIcon: 'size-4' }"
						@click="handleUndo"
					/>
				</div>

				<ol v-if="eventChips.length" class="flex flex-wrap gap-2">
					<li
						v-for="event in eventChips"
						:key="event.id"
						class="flex h-9 items-center gap-2 rounded-btn bg-canvas pr-3 pl-2.5 text-[13px] ring-1 ring-raised ring-inset"
						:class="event.faded && 'opacity-75'"
					>
						<span
							aria-hidden="true"
							class="size-2.5 rounded-full"
							:style="{ background: event.look.dot, boxShadow: event.look.swEdge }"
						/>
						<span class="font-semibold text-white">{{ event.team }}</span>
						<span class="font-bold" :class="event.positive ? 'text-success' : 'text-error'">{{
							event.delta
						}}</span>
						<span class="text-fg-soft">→ {{ event.after }} · {{ event.when }}</span>
					</li>
				</ol>
				<p v-else class="text-[13px] text-fg-soft">Nenhuma jogada ainda.</p>
			</section>

			<!-- Última jogada (visitante) -->
			<p v-else-if="!telao && lastEvent" role="status" class="text-center text-[13px] text-fg-soft">
				Última jogada:
				<strong class="font-semibold text-white">{{ lastEvent.team }} {{ lastEvent.delta }}</strong>
				· {{ lastEvent.when }}
			</p>
		</div>

		<ConfigPlacarModal
			v-if="isOwner"
			v-model="configModal"
			:placar="placar"
			@saved="handleSaved"
			@reset="handleReset"
			@deleted="handleDeleted"
		/>
	</div>
</template>
