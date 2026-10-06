<script setup lang="ts">
import type { TeamColor } from '~/utils/teamColors'

// Seletor de cor do time: botão com a cor atual que abre um painel com "Sólidas" e "Duplas".
// A cor do outro time fica desativada. O painel fecha ao escolher, pelo Esc ou clicando fora.
const model = defineModel<string>({ required: true })

const {
	taken,
	label,
	align = 'start',
	disabled = false,
} = defineProps<{
	/** Id da cor do outro time */
	taken: string
	/** Nome do seletor, ex.: "Cor do primeiro time" */
	label: string
	/** Alinhamento do painel com o botão: 'start' (primeiro time) ou 'end' (segundo time) */
	align?: 'start' | 'end'
	disabled?: boolean
}>()

const open = ref(false)

const current = computed(() => teamLook(model.value))

const SELECTED = '0 0 0 3px var(--color-canvas), 0 0 0 5px #ffffff'

function swatches(colors: readonly TeamColor[]) {
	return colors.map(color => {
		const look = teamLook(color.id)
		const selected = model.value === color.id
		return {
			...look,
			selected,
			ring: selected ? [SELECTED, look.swEdge].filter(ring => ring !== 'none').join(', ') : look.swEdge,
		}
	})
}

const groups = computed(() => [
	{ title: 'Sólidas', colors: swatches(SOLID_TEAM_COLORS) },
	{ title: 'Duplas', colors: swatches(DUAL_TEAM_COLORS) },
])

function pick(id: string) {
	model.value = id
	open.value = false
}
</script>

<template>
	<UPopover
		v-model:open="open"
		:content="{ side: 'bottom', align, sideOffset: 8, collisionPadding: 16 }"
		:ui="{
			content:
				'flex w-[384px] max-w-[calc(100vw-32px)] flex-col gap-2 rounded-[14px] bg-canvas p-3.5 shadow-[inset_0_0_0_1px_var(--color-edge),0_24px_48px_rgba(0,0,0,0.55)] ring-0',
		}"
	>
		<button
			type="button"
			:aria-label="`${label}: ${current.name}`"
			aria-haspopup="dialog"
			:disabled="disabled"
			class="flex h-12 w-full cursor-pointer items-center justify-between gap-2.5 rounded-field bg-canvas px-3 text-sm font-semibold text-fg ring-1 ring-edge transition-shadow ring-inset hover:ring-fg-dim disabled:cursor-not-allowed disabled:opacity-60"
		>
			<span class="flex min-w-0 items-center gap-2.5">
				<span
					aria-hidden="true"
					class="size-6 shrink-0 rounded-full"
					:style="{ background: current.dot, boxShadow: current.swEdge }"
				/>
				<span class="truncate">{{ current.name }}</span>
			</span>
			<UIcon name="i-lucide-chevron-down" class="size-[18px] shrink-0 text-fg-soft" aria-hidden="true" />
		</button>

		<template #content>
			<div role="group" :aria-label="label.replace(/^Cor/, 'Cores')" class="flex flex-col gap-2">
				<template v-for="group in groups" :key="group.title">
					<span class="text-xs font-semibold text-fg-soft" :class="group.title === 'Duplas' && 'mt-1'">
						{{ group.title }}
					</span>
					<div class="grid grid-cols-[repeat(auto-fill,44px)]">
						<button
							v-for="color in group.colors"
							:key="color.id"
							type="button"
							:aria-label="color.name"
							:title="color.name"
							:aria-pressed="color.selected"
							:disabled="color.id === taken"
							class="flex size-11 cursor-pointer items-center justify-center rounded-field transition-colors hover:bg-raised disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent"
							@click="pick(color.id)"
						>
							<span
								class="size-[26px] rounded-full"
								:style="{ background: color.dot, boxShadow: color.ring }"
							/>
						</button>
					</div>
				</template>
			</div>
		</template>
	</UPopover>
</template>
