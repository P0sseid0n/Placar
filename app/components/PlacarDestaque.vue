<script setup lang="ts">
import type { Database } from '~/types/database.types'

// Card grande de "Continuar de onde parou"
const { placar } = defineProps<{
	placar: Database['public']['Tables']['Placar']['Row']
}>()

const summary = computed(() => scoreSummary(placar))
const lookA = computed(() => teamLookFor(placar, 'a'))
const lookB = computed(() => teamLookFor(placar, 'b'))

const scoreClass = (team: 'a' | 'b') =>
	summary.value.leader !== null && summary.value.leader !== team ? 'text-fg-soft' : 'text-white'
</script>

<template>
	<NuxtLink
		:to="`/id/${placar.public_id}`"
		:aria-label="placarAriaLabel(placar)"
		class="group relative flex flex-col overflow-hidden rounded-feature bg-surface text-white ring-1 ring-raised transition-[box-shadow,background-color,transform] duration-200 ease-out ring-inset hover:-translate-y-0.5 hover:bg-surface-hover hover:ring-faint active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
	>
		<!-- No hover a faixa com as cores dos times engrossa (só transform, sem mexer no layout) -->
		<div
			aria-hidden="true"
			class="flex h-1.5 origin-top transition-transform duration-200 ease-out group-hover:scale-y-[1.67] motion-reduce:transition-none"
		>
			<span class="flex-1" :style="{ background: lookA.stripe }" />
			<span class="flex-1" :style="{ background: lookB.stripe }" />
		</div>

		<div class="flex flex-wrap items-center justify-between gap-6 p-[clamp(20px,3vw,32px)]">
			<div
				class="grid flex-[1_1_520px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[clamp(12px,3vw,40px)]"
			>
				<div class="flex min-w-0 items-center gap-3.5">
					<TeamMonogram :name="placar.team_a_name" :look="lookA" class="max-sm:hidden" />
					<div class="flex min-w-0 flex-col">
						<span class="text-base font-semibold max-sm:line-clamp-2 max-sm:wrap-break-word sm:truncate">{{
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
						<span class="text-base font-semibold max-sm:line-clamp-2 max-sm:wrap-break-word sm:truncate">{{
							placar.team_b_name
						}}</span>
						<span class="text-[13px] text-fg-soft">{{ summary.tag.b }}</span>
					</div>
					<TeamMonogram :name="placar.team_b_name" :look="lookB" class="max-sm:hidden" />
				</div>
			</div>

			<span class="shrink-0 text-[13px] text-fg-soft max-sm:w-full">
				<span class="font-id text-fg-strong">#{{ placar.public_id }}</span> ·
				{{ relativeTime(placar.created_at) }}
			</span>
		</div>
	</NuxtLink>
</template>
