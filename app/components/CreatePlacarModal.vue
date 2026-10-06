<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import Services from '~/services'

const toast = useToast()

const model = defineModel<boolean>()

const schema = z.object({
	teamA: z.string().min(1, 'Nome do time A é obrigatório'),
	teamB: z.string().min(1, 'Nome do time B é obrigatório'),
	score: z.number().min(1, 'O valor da pontuação deve ser maior que 0'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
	teamA: '',
	teamB: '',
	score: 1,
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
	loading.value = true

	Services.placar
		.create({
			score: event.data.score,
			teamA: event.data.teamA,
			teamB: event.data.teamB,
		})
		.then(placarId => {
			model.value = false

			navigateTo(`/id/${placarId}`)
		})
		.catch(error => {
			console.error(error)
			toast.add({
				color: 'error',
				title: 'Erro ao criar placar',
				description: error.message || 'Ocorreu um erro ao criar o placar. Tente novamente mais tarde.',
			})
		})
		.finally(() => {
			loading.value = false
		})
}

function handleCancel() {
	state.teamA = ''
	state.teamB = ''
	state.score = 1

	model.value = false
}
</script>

<template>
	<UModal v-model:open="model" title="Criando placar">
		<template #body>
			<UForm :schema="schema" :state="state" @submit="onSubmit">
				<div class="mb-6 grid grid-cols-1 md:grid-cols-[1fr_64px_1fr]">
					<UFormField label="Primeiro time" name="teamA">
						<UInput class="w-full" color="neutral" size="xl" placeholder="Time 1" v-model="state.teamA" :disabled="loading" />
					</UFormField>
					<div class="flex items-center justify-center pt-4 pb-2">vs</div>
					<UFormField label="Segundo time" name="teamB">
						<UInput class="w-full" color="neutral" size="xl" placeholder="Time 2" v-model="state.teamB" :disabled="loading" />
					</UFormField>
					<UFormField label="Valor da pontuação" name="score" class="mt-6">
						<UInput color="neutral" size="xl" type="number" placeholder="1" v-model="state.score" :disabled="loading" />
					</UFormField>
				</div>

				<div class="px-4 flex justify-between mt-8">
					<UButton
						class="px-8"
						color="neutral"
						size="lg"
						variant="ghost"
						label="Cancelar"
						type="button"
						@click="handleCancel"
						:disabled="loading"
					/>

					<UButton class="px-8" color="neutral" size="lg" variant="solid" label="Salvar" type="submit" :loading="loading" />
				</div>
			</UForm>
		</template>
	</UModal>
</template>
