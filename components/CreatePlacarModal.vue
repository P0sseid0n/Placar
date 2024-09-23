<script setup lang="ts">
import Services from '~/services'

const model = defineModel<boolean>()

const teamA = ref('')
const teamB = ref('')
const score = ref(1)

const loading = ref(false)

const isValidForm = computed(
	() => teamA.value.trim() !== '' && teamB.value.trim() !== '' && score.value !== undefined && score.value > 0
)

async function handleCreate() {
	if (!isValidForm.value) return

	loading.value = true

	Services.placar
		.create({
			score: score.value,
			teamA: teamA.value,
			teamB: teamB.value,
		})
		.then(placarId => {
			model.value = false

			navigateTo(`/id/${placarId}`)
		})
		.catch(error => {
			console.log('error')
			console.log(error)
		})
		.finally(() => {
			loading.value = false
		})
}

function handleCancel() {
	teamA.value = ''
	teamB.value = ''
	score.value = 1

	model.value = false
}
</script>

<template>
	<UModal v-model="model">
		<UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
			<template #header>
				<h1 class="w-full text-center text-xl">Criando Placar</h1>
			</template>

			<div>
				<UFormGroup label="Primeiro Time">
					<UInput class="mb-8" color="gray" size="xl" placeholder="Time 1" v-model="teamA" :disabled="loading" />
				</UFormGroup>
				<UFormGroup label="Segundo Time">
					<UInput class="mb-8" color="gray" size="xl" placeholder="Time 2" v-model="teamB" :disabled="loading" />
				</UFormGroup>
				<UFormGroup label="Valor da Pontuação">
					<UInput class="mb-4" color="gray" size="xl" type="number" placeholder="1" v-model="score" :disabled="loading" />
				</UFormGroup>
			</div>

			<template #footer>
				<div class="flex flex-row justify-between items-center gap-8 px-8">
					<UButton
						class="flex-1 justify-center"
						color="gray"
						size="xl"
						variant="ghost"
						label="Cancelar"
						@click="handleCancel"
						:disabled="loading"
					/>

					<UButton
						class="flex-1 justify-center"
						color="gray"
						size="xl"
						variant="ghost"
						label="Criar"
						@click="handleCreate"
						:disabled="!isValidForm"
						:loading="loading"
					/>
				</div>
			</template>
		</UCard>
	</UModal>
</template>
