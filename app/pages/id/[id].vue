<script setup lang="ts">
import Services from '~/services'
import GearIcon from '@/components/icons/GearIcon.vue'
import LoadingIcon from '@/components/icons/LoadingIcon.vue'

const route = useRoute()
const user = useSupabaseUser()
const toast = useToast()

const placarPublicId = String(route.params.id ?? '')

const { data: placar, error } = await useAsyncData(`placar-${placarPublicId}`, async () => {
	// IDs são gerados com 6 caracteres de 0-9 e a-z (services/placar.ts)
	if (!/^[0-9a-z]{6}$/.test(placarPublicId)) {
		throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
	}

	const placarPayload = await Services.placar.getById(placarPublicId)
	if (!placarPayload) {
		throw createError({ statusCode: 404, statusMessage: 'Placar não encontrado' })
	}
	return placarPayload
})

// Erros do useAsyncData não abrem a página de erro sozinhos; sem isso a tela ficava no spinner
if (error.value) {
	throw createError({
		statusCode: error.value.statusCode ?? 500,
		statusMessage: error.value.statusMessage ?? 'Erro interno do servidor',
		fatal: true,
	})
}

watchEffect(() => {
	if (placar.value) {
		useHead({ title: `Placar | ${placar.value.team_a_name} x ${placar.value.team_b_name}` })
	}
})

async function copyPlacarId() {
	try {
		await navigator.clipboard.writeText(placar.value!.public_id)
		toast.add({ color: 'success', title: 'ID copiado!', description: 'Quem tiver o ID pode ver o placar.' })
	} catch {
		toast.add({ color: 'error', title: 'Não foi possível copiar o ID' })
	}
}

// onMounted(() => {
// 	realtimeChannel = client
// 		.channel('schema-db-changes')
// 		.on(
// 			'postgres_changes',
// 			{
// 				event: 'UPDATE',
// 				schema: 'public',
// 			},
// 			() => findPlacar()
// 		)
// 		.subscribe()
// })

const isCreator = computed(() => {
	return !!user.value && user.value.sub === placar.value?.creator
})

// O data do useAsyncData é um shallowRef no Nuxt 4: alterar um campo não atualiza a tela,
// então as mudanças substituem o objeto inteiro
function setScores(scores: Partial<Pick<NonNullable<typeof placar.value>, 'team_a_score' | 'team_b_score'>>) {
	if (placar.value) placar.value = { ...placar.value, ...scores }
}

// Os cliques são salvos em fila: o serviço lê a pontuação atual antes de gravar,
// então duas gravações ao mesmo tempo poderiam perder um ponto.
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
	setScores({ [column]: optimistic })
	pendingSaves++

	saveQueue = saveQueue.then(async () => {
		const saved = await Services.placar.updateTeamScore(placarPublicId, team, action)
		pendingSaves--

		if (saved === null) {
			toast.add({ color: 'error', title: 'Não foi possível salvar o ponto', description: 'O placar foi recarregado.' })
			await refreshNuxtData(`placar-${placarPublicId}`)
			return
		}

		// Só aplica o valor do banco quando não há outros cliques na fila, para o número não "voltar"
		if (pendingSaves === 0) setScores({ [column]: saved })
	})
}

const configModal = ref(false)

function handleReset() {
	setScores({ team_a_score: 0, team_b_score: 0 })
}

function handleDeleted() {
	navigateTo('/painel')
}
</script>

<template>
	<div v-if="!placar" class="h-screen flex justify-center items-center">
		<LoadingIcon />
	</div>
	<div v-else class="h-screen flex flex-col">
		<header class="h-20 sm:h-32 flex flex-row items-center gap-2 px-4 sm:px-[10%]">
			<div class="shrink-0 sm:w-1/4">
				<UButton
					v-if="isCreator"
					color="neutral"
					variant="solid"
					size="xl"
					to="/painel"
					label="Painel"
					icon="i-material-symbols-chevron-left-rounded"
				/>
				<UButton
					v-else
					color="neutral"
					variant="solid"
					size="xl"
					to="/"
					label="Inicio"
					icon="i-material-symbols-chevron-left-rounded"
				/>
			</div>

			<div class="flex-1 text-center">
				<h1 class="text-2xl sm:text-5xl font-bold">Placar</h1>
			</div>

			<div class="shrink-0 sm:w-1/4 flex justify-end">
				<UButton
					v-if="isCreator"
					color="neutral"
					variant="solid"
					size="xl"
					aria-label="Configurações"
					@click="configModal = true"
				>
					<GearIcon />
					<span class="hidden sm:inline"> Configurações </span>
				</UButton>
			</div>
		</header>
		<div class="text-center mb-4">
			<h5 class="text-lg opacity-75">Pontuação</h5>
			<p class="text-base opacity-90">{{ placar.score_increment }}</p>
		</div>
		<main class="flex-1 grid grid-cols-3 px-[5%]">
			<div class="self-center grid grid-cols-2">
				<div v-if="isCreator" class="flex flex-col gap-4 flex-wrap items-center justify-center">
					<UButton
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-add-rounded"
						:aria-label="`Somar ${placar.score_increment} para ${placar.team_a_name}`"
						@click="() => handleUpdateScore('a', 'increment')"
					/>
					<UButton
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-remove-rounded"
						:aria-label="`Tirar ${placar.score_increment} do ${placar.team_a_name}`"
						@click="() => handleUpdateScore('a', 'decrement')"
					/>
				</div>
				<div :class="{ 'col-span-2': !isCreator }">
					<h4 class="text-center text-sm sm:text-[2vw] leading-none">{{ placar.team_a_name }}</h4>
					<h2 class="text-center text-[20vw] leading-none">{{ placar.team_a_score }}</h2>
				</div>
			</div>
			<USeparator orientation="vertical" type="dashed" size="xl" />
			<div class="self-center grid grid-cols-2">
				<div :class="{ 'col-span-2': !isCreator }">
					<h4 class="text-center text-sm sm:text-[2vw] leading-none">{{ placar.team_b_name }}</h4>
					<h2 class="text-center text-[20vw] leading-none">{{ placar.team_b_score }}</h2>
				</div>
				<div v-if="isCreator" class="flex flex-col gap-4 flex-wrap items-center justify-center">
					<UButton
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-add-rounded"
						:aria-label="`Somar ${placar.score_increment} para ${placar.team_b_name}`"
						@click="() => handleUpdateScore('b', 'increment')"
					/>
					<UButton
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-remove-rounded"
						:aria-label="`Tirar ${placar.score_increment} do ${placar.team_b_name}`"
						@click="() => handleUpdateScore('b', 'decrement')"
					/>
				</div>
			</div>
		</main>
		<footer class="h-32 flex justify-center items-center">
			<UButton color="neutral" variant="ghost" size="xl" :aria-label="`Copiar ID do placar ${placar.public_id}`" @click="copyPlacarId">
				<span class="opacity-50">#</span>{{ placar.public_id }}
			</UButton>
		</footer>

		<ConfigPlacarModal
			v-if="isCreator"
			v-model="configModal"
			:placar-id="placar.public_id"
			@reset="handleReset"
			@deleted="handleDeleted"
		/>
	</div>
</template>
