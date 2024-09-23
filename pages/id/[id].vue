<script setup lang="ts">
import Services from '~/services'
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon.vue'
import GearIcon from '@/components/icons/GearIcon.vue'
import LoadingIcon from '@/components/icons/LoadingIcon.vue'
import type { RealtimeChannel } from '@supabase/supabase-js'

import ErrorPage from '@/components/ErrorPage.vue'

const route = useRoute()

type Placar = Awaited<ReturnType<typeof Services.placar.getById>>

const user = useSupabaseUser()
const client = useSupabaseClient()

let realtimeChannel: RealtimeChannel

type ErrorsCode = '400' | '404' | '500'
const placar = ref<Placar>()
const errorCode = ref<ErrorsCode>()
const placarId = route.params.id

async function findPlacar() {
	if (!placarId || typeof placarId !== 'string') {
		errorCode.value = '400'
		return
	}

	try {
		const placarPayload = await Services.placar.getById(placarId)

		if (!placarPayload) errorCode.value = '404'

		placar.value = placarPayload || undefined

		useHead({
			title: 'Placar | ' + placarId,
		})
	} catch (error) {
		errorCode.value = '500'
	}
}

function copyPlacarId() {
	if (!placarId || typeof placarId !== 'string') return

	navigator.clipboard.writeText(placarId)

	window.alert('ID copiado!')
}

onMounted(() => {
	findPlacar()

	realtimeChannel = client
		.channel('schema-db-changes')
		.on(
			'postgres_changes',
			{
				event: 'UPDATE',
				schema: 'public',
			},
			() => findPlacar()
		)
		.subscribe()
})

onUnmounted(() => {
	realtimeChannel.unsubscribe()
})

const isCreator = computed(() => {
	return user.value?.id === placar.value?.creator
})

function increaseScore(team: string) {
	if (!placar.value) return

	// placar.value[team]++
}

const configModal = ref(false)

const fontSize = ref<'10vw' | '15vw' | '20vw'>('20vw')
</script>

<template>
	<ErrorPage v-if="errorCode" :error-code="errorCode" />
	<div v-else-if="!placar" class="h-screen flex justify-center items-center">
		<LoadingIcon />
	</div>
	<div v-else class="h-screen flex flex-col">
		<UModal v-model="configModal">
			<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
				<template #header>
					<h1 class="w-full text-center text-xl">Criando Placar</h1>
				</template>
				<div class="flex flex-col items-center gap-8">
					<!-- Botão de zerar -->
					<UButton
						color="gray"
						variant="solid"
						size="xl"
						@click="() => Services.placar.resetScore(placarId as string)"
						label="Reiniciar placar"
					/>
					<!-- Botão de apagar placar -->
					<UButton
						color="red"
						variant="ghost"
						size="xl"
						@click="() => Services.placar.deletePlacar(placarId as string)"
						label="Apagar placar"
					/>
				</div>
			</UCard>
		</UModal>

		<header class="h-32 flex flex-row items-center px-[10%]">
			<div class="w-1/4">
				<UButton
					v-if="isCreator"
					color="gray"
					variant="solid"
					size="xl"
					to="/painel"
					label="Painel"
					icon="i-material-symbols-chevron-left-rounded"
				/>
				<UButton
					v-else
					color="gray"
					variant="solid"
					size="xl"
					to="/"
					label="Inicio"
					icon="i-material-symbols-chevron-left-rounded"
				/>
			</div>

			<div class="flex-1 text-center">
				<h1 class="text-5xl font-bold">Placar</h1>
			</div>

			<div class="w-1/4 flex justify-end">
				<UButton v-if="isCreator" color="gray" variant="solid" size="xl" @click="configModal = true">
					<GearIcon />
					<span> Configurações </span>
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
						color="gray"
						variant="solid"
						size="xl"
						icon="i-material-symbols-add-rounded"
						@click="() => Services.placar.updateTeamScore(placarId as string, 'a', 'increment')"
					/>
					<UButton
						color="gray"
						variant="solid"
						size="xl"
						icon="i-material-symbols-remove-rounded"
						@click="() => Services.placar.updateTeamScore(placarId as string, 'a', 'decrement')"
					/>
				</div>
				<div :class="{ 'col-span-2': !isCreator }">
					<h4 class="text-center text-[2vw] leading-none">{{ placar.team_a_name }}</h4>
					<h2 class="text-center text-[20vw] leading-none">{{ placar.team_a_score }}</h2>
				</div>
			</div>
			<UDivider orientation="vertical" type="dashed" size="xl" />
			<div class="self-center grid grid-cols-2">
				<div :class="{ 'col-span-2': !isCreator }">
					<h4 class="text-center text-[2vw] leading-none">{{ placar.team_b_name }}</h4>
					<h2 class="text-center text-[20vw] leading-none">{{ placar.team_b_score }}</h2>
				</div>
				<div v-if="isCreator" class="flex flex-col gap-4 flex-wrap items-center justify-center">
					<UButton
						color="gray"
						variant="solid"
						size="xl"
						icon="i-material-symbols-add-rounded"
						@click="() => Services.placar.updateTeamScore(placarId as string, 'b', 'increment')"
					/>
					<UButton
						color="gray"
						variant="solid"
						size="xl"
						icon="i-material-symbols-remove-rounded "
						@click="() => Services.placar.updateTeamScore(placarId as string, 'b', 'decrement')"
					/>
				</div>
			</div>
		</main>
		<footer class="h-32 flex justify-center items-center">
			<UButton color="white" variant="solid" size="xl" @click="copyPlacarId">
				<span class="opacity-50">#</span>{{ placarId }}
			</UButton>
		</footer>
	</div>
</template>
