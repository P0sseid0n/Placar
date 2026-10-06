<script setup lang="ts">
import type { Database } from '~/types/database.types'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()

const fullName = computed(() => (user.value?.user_metadata?.full_name as string | undefined) ?? '')
const avatarUrl = computed(() => user.value?.user_metadata?.avatar_url as string | undefined)
const avatarFailed = ref(false)
const initial = computed(() => fullName.value.trim()[0]?.toUpperCase() ?? '?')

const signingOut = ref(false)

async function signOut() {
	signingOut.value = true
	await client.auth.signOut()
	signingOut.value = false
}

watchEffect(() => {
	if (!user.value) {
		navigateTo('/')
	}
})
</script>

<template>
	<header class="border-b border-raised">
		<div class="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-[clamp(16px,5vw,64px)]">
			<NuxtLink to="/painel" class="rounded-btn" aria-label="Placar, ir para o painel">
				<AppLogo />
			</NuxtLink>

			<div class="flex items-center gap-2">
				<div class="flex h-11 items-center gap-2.5 rounded-full py-0 pr-1.5 pl-1.5 ring-1 ring-inset ring-raised sm:pr-3">
					<img
						v-if="avatarUrl && !avatarFailed"
						:src="avatarUrl"
						alt=""
						class="size-8 rounded-full object-cover"
						referrerpolicy="no-referrer"
						@error="avatarFailed = true"
					/>
					<span
						v-else
						aria-hidden="true"
						class="flex size-8 items-center justify-center rounded-full bg-edge text-sm font-bold text-white"
					>
						{{ initial }}
					</span>
					<span class="text-sm font-semibold text-white max-sm:sr-only">{{ fullName }}</span>
				</div>

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
	</header>
</template>
