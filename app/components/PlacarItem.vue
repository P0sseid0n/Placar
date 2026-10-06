<script setup lang="ts">
import type { Database } from '~/types/database.types'

const { placar } = defineProps<{
	placar: Database['public']['Tables']['Placar']['Row']
}>()

const summary = computed(() => scoreSummary(placar))

// Quem perde fica em cinza; em empate os dois ficam brancos
const rows = computed(() =>
	(['a', 'b'] as const).map(team => ({
		team,
		name: team === 'a' ? placar.team_a_name : placar.team_b_name,
		score: summary.value[team],
		look: teamLookFor(placar, team),
		losing: summary.value.leader !== null && summary.value.leader !== team,
	})),
)

const ariaLabel = computed(
	() => `Abrir placar ${placar.team_a_name} ${summary.value.a} x ${summary.value.b} ${placar.team_b_name}`,
)
</script>

<template>
	<NuxtLink
		:to="`/id/${placar.public_id}`"
		:aria-label="ariaLabel"
		class="group flex h-full flex-col gap-4 rounded-card bg-surface px-5 py-[18px] text-white ring-1 ring-raised transition-[box-shadow,background-color,transform] duration-150 ring-inset hover:-translate-y-0.5 hover:bg-[#202024] hover:ring-faint motion-reduce:hover:translate-y-0"
	>
		<div class="flex items-center justify-between gap-2">
			<span class="inline-flex h-6 items-center rounded-chip bg-raised px-2 font-id text-xs text-fg-strong">
				#{{ placar.public_id }}
			</span>
			<span class="text-xs text-fg-soft">{{ relativeTime(placar.created_at) }}</span>
		</div>

		<div class="flex flex-col gap-2.5">
			<div v-for="row in rows" :key="row.team" class="flex items-center gap-3">
				<span
					aria-hidden="true"
					class="h-7 w-1 shrink-0 rounded-[2px]"
					:style="{ background: row.look.bar, boxShadow: row.look.edge }"
				/>
				<span
					class="min-w-0 flex-1 truncate text-[15px] font-semibold"
					:class="row.losing ? 'text-fg-soft' : 'text-white'"
				>
					{{ row.name }}
				</span>
				<span
					class="font-score text-[32px] leading-none font-bold"
					:class="row.losing ? 'text-fg-soft' : 'text-white'"
				>
					{{ row.score }}
				</span>
			</div>
		</div>

		<div class="mt-auto flex items-center justify-between gap-2 border-t border-raised pt-3.5">
			<span class="truncate text-[13px] text-fg-soft">{{ summary.status }}</span>
			<span
				class="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-fg-soft group-hover:text-white"
			>
				Abrir
				<UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
			</span>
		</div>
	</NuxtLink>
</template>
