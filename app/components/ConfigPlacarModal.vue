<script setup lang="ts">
import Services from '~/services'

const model = defineModel<boolean>()
const { placarId } = defineProps<{
	placarId: string
}>()
const emit = defineEmits<{
	reset: []
	deleted: []
}>()

const toast = useToast()

const loading = ref<'reset' | 'delete' | null>(null)
const confirmingDelete = ref(false)

// Ao fechar o modal, a confirmação de apagar volta ao início
watch(model, open => {
	if (!open) confirmingDelete.value = false
})

async function handleReset() {
	loading.value = 'reset'

	try {
		await Services.placar.resetScore(placarId)
		emit('reset')
		toast.add({ color: 'success', title: 'Placar zerado' })
		model.value = false
	} catch (error) {
		console.error(error)
		toast.add({ color: 'error', title: 'Não foi possível zerar o placar', description: 'Tente novamente.' })
	} finally {
		loading.value = null
	}
}

async function handleDelete() {
	loading.value = 'delete'

	try {
		await Services.placar.deletePlacar(placarId)
		toast.add({ color: 'success', title: 'Placar apagado' })
		model.value = false
		emit('deleted')
	} catch (error) {
		console.error(error)
		toast.add({ color: 'error', title: 'Não foi possível apagar o placar', description: 'Tente novamente.' })
	} finally {
		loading.value = null
	}
}
</script>

<template>
	<UModal v-model:open="model" title="Configurações">
		<template #body>
			<div class="flex flex-col items-center gap-8">
				<UButton
					color="neutral"
					variant="solid"
					size="xl"
					label="Reiniciar placar"
					:loading="loading === 'reset'"
					:disabled="loading !== null"
					@click="handleReset"
				/>

				<UButton
					v-if="!confirmingDelete"
					color="error"
					variant="ghost"
					size="xl"
					label="Apagar placar"
					:disabled="loading !== null"
					@click="confirmingDelete = true"
				/>
				<div v-else class="flex flex-col items-center gap-3" role="group" aria-label="Confirmar exclusão">
					<p class="text-center text-sm text-fg-soft">O placar e o ID deixam de existir. Não dá para desfazer.</p>
					<div class="flex gap-2">
						<UButton
							color="neutral"
							variant="ghost"
							size="lg"
							label="Cancelar"
							:disabled="loading !== null"
							@click="confirmingDelete = false"
						/>
						<UButton
							color="error"
							variant="solid"
							size="lg"
							label="Sim, apagar"
							:loading="loading === 'delete'"
							:disabled="loading !== null"
							@click="handleDelete"
						/>
					</div>
				</div>
			</div>
		</template>
	</UModal>
</template>
