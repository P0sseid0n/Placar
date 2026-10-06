<script setup lang="ts">
// Foto do Discord (user_metadata.avatar_url); sem foto, ou se ela falhar, mostra a inicial do nome
const { size = 32 } = defineProps<{
	/** Lado em px: 32 no cabeçalho, 76 no perfil */
	size?: number
}>()

const user = useSupabaseUser()

const avatarUrl = computed(() => user.value?.user_metadata?.avatar_url as string | undefined)
const fullName = computed(() => (user.value?.user_metadata?.full_name as string | undefined) ?? '')
const initial = computed(() => fullName.value.trim()[0]?.toUpperCase() ?? '?')
const failed = ref(false)

const style = computed(() => ({
	width: `${size}px`,
	height: `${size}px`,
	fontSize: `${Math.round(size * 0.4)}px`,
}))
</script>

<template>
	<img
		v-if="avatarUrl && !failed"
		:src="avatarUrl"
		alt=""
		class="shrink-0 rounded-full object-cover"
		:style="style"
		referrerpolicy="no-referrer"
		@error="failed = true"
	/>
	<span
		v-else
		aria-hidden="true"
		class="flex shrink-0 items-center justify-center rounded-full bg-edge font-bold text-white"
		:style="style"
	>
		{{ initial }}
	</span>
</template>
