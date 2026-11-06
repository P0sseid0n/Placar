<script setup lang="ts">
import type { Database } from '~/types/database.types'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()

const fullName = computed(() => (user.value?.user_metadata?.full_name as string | undefined) ?? '')

const toast = useToast()

const profileOpen = ref(false)
const signingOut = ref(false)

async function signOut() {
	signingOut.value = true
	try {
		const { error } = await client.auth.signOut()
		if (error) throw error
	} catch (error) {
		console.error(error)
		toast.add({ color: 'error', title: 'Não foi possível sair', description: 'Tente novamente.' })
	} finally {
		signingOut.value = false
	}
}

watchEffect(() => {
	if (!user.value) {
		navigateTo('/')
	}
})
</script>

<template>
	<header class="border-b border-raised">
		<div class="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-[clamp(16px,5vw,64px)]">
			<NuxtLink to="/painel" class="rounded-btn" aria-label="Placar, ir para o painel">
				<AppLogo />
			</NuxtLink>

			<div class="flex items-center gap-2">
				<button
					type="button"
					aria-label="Abrir perfil"
					aria-haspopup="dialog"
					class="flex h-11 cursor-pointer items-center gap-2.5 rounded-full py-0 pr-1.5 pl-1.5 ring-1 ring-raised transition-colors ring-inset hover:bg-raised sm:pr-3"
					@click="profileOpen = true"
				>
					<UserAvatar :size="32" />
					<span class="text-sm font-semibold text-white max-sm:sr-only">{{ fullName }}</span>
				</button>

				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-log-out"
					aria-label="Sair"
					:loading="signingOut"
					class="size-11 justify-center rounded-btn text-fg-soft hover:bg-raised hover:text-white"
					:ui="{ leadingIcon: 'size-5' }"
					@click="signOut"
				/>
			</div>
		</div>

		<ProfileModal v-model="profileOpen" />
	</header>
</template>
