<script setup lang="ts">
import Services from '~/services'
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon.vue'
import GearIcon from '@/components/icons/GearIcon.vue'
import LoadingIcon from '@/components/icons/LoadingIcon.vue'

import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

const route = useRoute()

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()

let realtimeChannel: RealtimeChannel

const {
	data: placar,
	pending,
	error,
} = useAsyncData('placar', async () => {
	const placarPublicId = route.params.id

	if (!placarPublicId || typeof placarPublicId !== 'string') {
		throw createError({ statusCode: 400, message: 'ID inválido' })
	}
	const placarPayload = await Services.placar.getById(placarPublicId)
	if (!placarPayload) {
		throw createError({ statusCode: 404, message: 'Placar não encontrado' })
	}
	return placarPayload
})

watchEffect(() => {
	if (placar.value) {
		useHead({ title: `Placar | ${placar.value.team_a_name} x ${placar.value.team_b_name}` })
	}
})

function copyPlacarId() {
	navigator.clipboard.writeText(placar.value!.public_id)

	window.alert('ID copiado!')
}

onMounted(() => {
	// realtimeChannel = client
	// 	.channel('schema-db-changes')
	// 	.on(
	// 		'postgres_changes',
	// 		{
	// 			event: 'UPDATE',
	// 			schema: 'public',
	// 		},
	// 		() => findPlacar()
	// 	)
	// 	.subscribe()
})

onUnmounted(() => {
	// realtimeChannel.unsubscribe()
})

const isCreator = computed(() => {
	return user.value?.id === placar.value?.creator
})

function handleUpdateScore(team: 'a' | 'b', action: 'increment' | 'decrement') {
	if (!placar.value) return

	Services.placar.updateTeamScore(placar.value!.public_id, team, action)
}

const configModal = ref(false)

const fontSize = ref<'10vw' | '15vw' | '20vw'>('20vw')
</script>

<template>
	<div v-if="!placar" class="h-screen flex justify-center items-center">
		<LoadingIcon />
	</div>
	<div v-else class="h-screen flex flex-col">
		<header class="h-32 flex flex-row items-center px-[10%]">
			<div class="w-1/4">
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
				<h1 class="text-5xl font-bold">Placar</h1>
			</div>

			<div class="w-1/4 flex justify-end">
				<UButton v-if="isCreator" color="neutral" variant="solid" size="xl" @click="configModal = true">
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
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-add-rounded"
						@click="() => handleUpdateScore('a', 'increment')"
					/>
					<UButton
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-remove-rounded"
						@click="() => handleUpdateScore('a', 'decrement')"
					/>
				</div>
				<div :class="{ 'col-span-2': !isCreator }">
					<h4 class="text-center text-[2vw] leading-none">{{ placar.team_a_name }}</h4>
					<h2 class="text-center text-[20vw] leading-none">{{ placar.team_a_score }}</h2>
				</div>
			</div>
			<USeparator orientation="vertical" type="dashed" size="xl" />
			<div class="self-center grid grid-cols-2">
				<div :class="{ 'col-span-2': !isCreator }">
					<h4 class="text-center text-[2vw] leading-none">{{ placar.team_b_name }}</h4>
					<h2 class="text-center text-[20vw] leading-none">{{ placar.team_b_score }}</h2>
				</div>
				<div v-if="isCreator" class="flex flex-col gap-4 flex-wrap items-center justify-center">
					<UButton
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-add-rounded"
						@click="() => handleUpdateScore('b', 'increment')"
					/>
					<UButton
						color="neutral"
						variant="solid"
						size="xl"
						icon="i-material-symbols-remove-rounded "
						@click="() => handleUpdateScore('b', 'decrement')"
					/>
				</div>
			</div>
		</main>
		<footer class="h-32 flex justify-center items-center">
			<UButton color="neutral" variant="ghost" size="xl" @click="copyPlacarId">
				<span class="opacity-50">#</span>{{ placar.public_id }}
			</UButton>
		</footer>
	</div>
</template>
