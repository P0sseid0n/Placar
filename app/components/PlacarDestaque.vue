<script setup lang="ts">
import type { Database } from '~/types/database.types'

// Card grande de "Continuar de onde parou"
const { placar } = defineProps<{
	placar: Database['public']['Tables']['Placar']['Row']
}>()

const summary = computed(() => scoreSummary(placar))
const colorA = computed(() => teamColor(placar, 'a'))
const colorB = computed(() => teamColor(placar, 'b'))

const scoreClass = (team: 'a' | 'b') =>
	summary.value.leader !== null && summary.value.leader !== team ? 'text-fg-soft' : 'text-white'
</script>

<template>
	<NuxtLink
		:to="`/id/${placar.public_id}`"
		:aria-label="`Abrir placar ${placar.team_a_name} ${summary.a} x ${summary.b} ${placar.team_b_name}`"
		class="group relative flex flex-col overflow-hidden rounded-feature bg-surface text-white ring-1 ring-raised ring-inset"
	>
		<div aria-hidden="true" class="flex h-1.5">
			<span class="flex-1" :style="{ background: colorA }" />
			<span class="flex-1" :style="{ background: colorB }" />
		</div>

		<div class="flex flex-wrap items-center justify-between gap-6 p-[clamp(20px,3vw,32px)]">
			<div
				class="grid flex-[1_1_520px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[clamp(12px,3vw,40px)]"
			>
				<div class="flex min-w-0 items-center gap-3.5">
					<TeamMonogram :name="placar.team_a_name" :color="colorA" class="max-sm:hidden" />
					<div class="flex min-w-0 flex-col">
						<span class="text-base font-semibold max-sm:line-clamp-2 max-sm:break-words sm:truncate">{{
							placar.team_a_name
						}}</span>
						<span class="text-[13px] text-fg-soft">{{ summary.tag.a }}</span>
					</div>
				</div>

				<div class="flex items-center gap-[clamp(10px,2vw,24px)] font-score leading-none font-bold">
					<span class="text-[clamp(56px,7vw,88px)]" :class="scoreClass('a')">{{ summary.a }}</span>
					<span class="text-[32px] text-faint">:</span>
					<span class="text-[clamp(56px,7vw,88px)]" :class="scoreClass('b')">{{ summary.b }}</span>
				</div>

				<div class="flex min-w-0 items-center justify-end gap-3.5 text-right">
					<div class="flex min-w-0 flex-col">
						<span class="text-base font-semibold max-sm:line-clamp-2 max-sm:break-words sm:truncate">{{
							placar.team_b_name
						}}</span>
						<span class="text-[13px] text-fg-soft">{{ summary.tag.b }}</span>
					</div>
					<TeamMonogram :name="placar.team_b_name" :color="colorB" class="max-sm:hidden" />
				</div>
			</div>

			<div
				class="flex shrink-0 flex-col items-end gap-2.5 max-sm:w-full max-sm:flex-row max-sm:items-center max-sm:justify-between"
			>
				<span class="text-[13px] text-fg-soft">
					<span class="font-id text-fg-strong">#{{ placar.public_id }}</span> ·
					{{ relativeTime(placar.created_at) }}
				</span>
				<span
					class="inline-flex h-11 items-center gap-1.5 rounded-btn bg-white px-4 text-sm font-semibold text-canvas group-hover:bg-fg"
				>
					Abrir placar
					<UIcon name="i-lucide-arrow-right" class="size-[18px]" aria-hidden="true" />
				</span>
			</div>
		</div>
	</NuxtLink>
</template>
