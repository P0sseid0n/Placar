<script setup lang="ts">
import type { Database } from '~/types/database.types'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()

async function signOut() {
	await client.auth.signOut()
}

watchEffect(() => {
	if (!user.value) {
		navigateTo('/')
	}
})
</script>

<template>
	<header class="w-full h-32 border-b border-zinc-800">
		<div class="container h-full flex flex-row items-center px-[10%] mx-auto">
			<div class="w-1/4">
				<UButton
					icon="i-mingcute-align-arrow-left-line"
					color="neutral"
					variant="subtle"
					size="xl"
					label="Sair"
					@click="signOut"
					loading-auto
				/>
			</div>

			<h1 class="flex-1 text-5xl font-bold text-center">Placar</h1>

			<div class="w-1/4 flex flex-row items-center justify-end gap-1">
				<UIcon name="i-material-symbols-person" class="text-2xl" />
				<span class="text-md font-semibold"> {{ user?.user_metadata.full_name }} </span>
			</div>
		</div>
	</header>
</template>

<style></style>
