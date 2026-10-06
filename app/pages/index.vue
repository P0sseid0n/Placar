<script setup lang="ts">
import type { Provider } from '@supabase/supabase-js'

useHead({
	title: 'Placar | Login',
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const id = ref('')

watch(id, () => {
	if (id.value === '') return

	id.value = id.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

	if (!id.value.startsWith('#')) id.value = '#' + id.value
})

watchEffect(() => {
	if (user.value) {
		navigateTo('/painel')
	}
})

function goToPlacar() {
	const routeId = id.value.slice(1).trim().toLowerCase()

	console.log('Login -> goToPlacar -> routeId', routeId, routeId.length)
	if (routeId.length < 6) return

	navigateTo('/id/' + routeId)
}

function signInWithOAuth(provider: Provider) {
	client.auth.signInWithOAuth({ provider })
}
</script>

<template>
	<div id="Login" class="h-screen flex flex-col items-center justify-center gap-32">
		<div class="text-center">
			<h2 class="text-lg font-medium opacity-75">Bem-vindo(a) ao</h2>
			<h1 class="text-8xl font-bold">Placar</h1>
		</div>

		<div class="text-center w-full max-w-80">
			<h3 class="text-base font-normal opacity-75 mb-8">Entre para criar um placar</h3>

			<UButton
				class="h-12"
				color="neutral"
				label="Entrar com Discord"
				icon="i-simple-icons-discord"
				block
				@click="() => signInWithOAuth('discord')"
			/>

			<USeparator class="my-12 opacity-75" label="Ou" />

			<div class="relative flex items-center justify-center">
				<input
					class="container-card outline-none w-full text-center text-base h-12 rounded px-2 py-4"
					type="text"
					placeholder="Digite o ID do Placar"
					v-model="id"
					maxlength="7"
					@keypress.enter="goToPlacar"
				/>
				<button
					@click="goToPlacar"
					class="rounded text-3xl h-10 w-10 flex items-center justify-center absolute right-2 bg-white/5 hover:bg-white/10"
				>
					<UIcon name="i-iconamoon-arrow-right-2-light" />
				</button>
			</div>
		</div>
	</div>
</template>
