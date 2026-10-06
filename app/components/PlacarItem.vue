<script setup lang="ts">
import type { Database } from '~/types/database.types'

const { placar } = defineProps<{
	placar: Database['public']['Tables']['Placar']['Row']
}>()
</script>

<template>
	<NuxtLink
		:to="`/id/${placar.id}`"
		class="group container-card h-36 w-64 relative cursor-pointer rounded-lg no-underline text-white flex flex-col items-center justify-center gap-3"
	>
		<div
			class="opacity-0 absolute top-1 right-0 size-8 rounded-md text-2xl transition-all duration-300 hover:opacity-100 group-hover:opacity-50"
		>
			<UIcon name="i-iconamoon-arrow-right-2-light" />
		</div>
		<h3 class="w-full text-xl text-center font-normal"><span class="opacity-50">#</span>{{ placar.id }}</h3>
		<div class="card-content w-full flex items-center justify-between">
			<div class="flex flex-col items-center content-center flex-1">
				<h4 class="text-xs font-bold">{{ placar.team_a_name }}</h4>
				<h2 class="opacity-60 text-3xl font-normal">{{ placar.team_a_score }}</h2>
			</div>
			<div class="flex flex-col items-center content-center flex-1">
				<h4 class="text-xs font-bold">{{ placar.team_b_name }}</h4>
				<h2 class="opacity-60 text-3xl font-normal">{{ placar.team_b_score }}</h2>
			</div>
		</div>
	</NuxtLink>
</template>

<style></style>
