<script setup lang="ts">
import Services from '~/services'

const { data: placares, status: placaresStatus } = useAsyncData(() => Services.placar.getAll())

const createPlacarModal = ref(false)

useHead({
	title: 'Placar',
})
</script>

<template>
	<div id="Painel" class="h-screen flex flex-col bg-zinc-900">
		<CreatePlacarModal v-model="createPlacarModal" />
		<Header />
		<main class="mt-4">
			<div class="container mx-auto px-[10%]">
				<div class="m-4 p-0 px-[3%] flex">
					<UButton
						icon="i-material-symbols-add-rounded"
						size="lg"
						color="neutral"
						variant="solid"
						@click="createPlacarModal = true"
					>
						Criar placar
					</UButton>
				</div>
				<div v-if="placares?.length" class="flex justify-center flex-wrap gap-8 px-[3%] mt-4 mb-8 overflow-y-auto">
					<PlacarItem v-for="placar in placares" :key="placar.id" :placar />
				</div>
				<div v-else class="flex flex-col items-center justify-center py-16 opacity-80">
					<UIcon name="i-material-symbols-inbox-rounded" class="text-9xl text-zinc-500 mb-4" />
					<h2 class="text-md font-medium opacity-80">Nenhum placar criado ainda</h2>
				</div>
			</div>
		</main>
	</div>
</template>
