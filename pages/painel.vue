<script setup lang="ts">
import Services from '~/services'

import CreatePlacarModal from '@/components/CreatePlacarModal.vue'

const user = useSupabaseUser()
const client = useSupabaseClient()

const { data: placares, status: placaresStatus } = useAsyncData(() => Services.placar.getAll())

const createPlacarModal = ref(false)

watchEffect(() => {
	if (!user.value) {
		navigateTo('/')
	}
})

useHead({
	title: 'Placar',
})
</script>

<template>
	<CreatePlacarModal v-model="createPlacarModal" />
	<div id="List" class="h-screen flex flex-col">
		<header class="h-32 flex flex-row items-center px-[10%]">
			<div class="w-1/4">
				<UButton
					icon="i-mingcute-align-arrow-left-line"
					color="gray"
					variant="solid"
					size="xl"
					@click="() => client.auth.signOut()"
					label="Sair"
				/>
			</div>

			<div class="flex-1">
				<h1 class="text-5xl font-bold text-center">Placar</h1>
			</div>

			<div class="w-1/4 flex flex-row items-center justify-end gap-1">
				<UIcon name="i-material-symbols-person" class="text-2xl" />
				<span class="text-base"> {{ user?.user_metadata.full_name }} </span>
			</div>
		</header>
		<main class="flex justify-center flex-wrap gap-8 px-[3%] mt-4 mb-8 overflow-y-auto">
			<NuxtLink
				:to="`/id/${placar.id}`"
				class="group container-card h-36 w-64 relative cursor-pointer rounded-lg no-underline text-white flex flex-col items-center justify-center gap-3"
				v-for="placar in placares"
			>
				<div
					class="opacity-0 absolute top-1 right-0 w-8 h-8 rounded-md text-2xl transition-all duration-300 hover:opacity-100 group-hover:opacity-50"
				>
					<UIcon name="i-iconamoon-arrow-right-2-light" />
				</div>
				<h3 class="w-full text-xl text-center font-normal"><span class="opacity-50">#</span>{{ placar.id }}</h3>
				<div class="card-content w-full flex items-center justify-between">
					<div class="flex flex-col items-center content-center flex-1">
						<h4 class="text-xs font-bold">{{ placar.team_a_name }}</h4>
						<h2 class="opacity-60 text-3xl font-normal">{{ placar.team_a_score }}</h2>
					</div>
					<div class="flex flex-col items-center content-center flex-1">
						<h4 class="text-xs font-bold">{{ placar.team_b_name }}</h4>
						<h2 class="opacity-60 text-3xl font-normal">{{ placar.team_b_score }}</h2>
					</div>
				</div>
			</NuxtLink>
		</main>
		<footer class="m-4 p-0 px-[3%] flex items-center justify-center">
			<UButton icon="i-material-symbols-add-rounded" size="xl" color="gray" variant="solid" @click="createPlacarModal = true">
				Criar Placar
			</UButton>
		</footer>
	</div>
</template>
