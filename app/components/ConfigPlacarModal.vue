<script setup lang="ts">
import Services from '~/services'

const model = defineModel<boolean>()
const { placarId } = defineProps<{
	placarId: string
}>()

function handleReset() {
	Services.placar.resetScore(placarId)
}

function handleDelete() {
	Services.placar.deletePlacar(placarId)
}
</script>

<template>
	<UModal v-model:open="model">
		<UCard>
			<template #header>
				<h1 class="w-full text-center text-xl">Criando Placar</h1>
			</template>
			<div class="flex flex-col items-center gap-8">
				<!-- Botão de zerar -->
				<UButton color="neutral" variant="solid" size="xl" @click="handleReset" label="Reiniciar placar" />
				<!-- Botão de apagar placar -->
				<UButton color="error" variant="ghost" size="xl" @click="handleDelete" label="Apagar placar" />
			</div>
		</UCard>
	</UModal>
</template>

<style></style>
