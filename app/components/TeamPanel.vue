<script setup lang="ts">
import type { TeamAnimation } from '~/composables/useScoreAnimation'
import type { TeamLook } from '~/utils/teamColors'

// Painel de um time na página do placar. `owner` tem os botões de pontuar; `viewer` é só leitura.
const { name, look, score, increment, scoreSize, variant, status, animation } = defineProps<{
	name: string
	look: TeamLook
	score: number
	increment: number
	/** P, M ou G */
	scoreSize: string | null
	variant: 'owner' | 'viewer'
	/** Situação do time: 'leader' (na frente), 'trailing' (atrás, com `behind` pontos) ou 'tie' */
	status: 'leader' | 'trailing' | 'tie'
	behind?: number
	/** Jogada sendo animada (chega pelo realtime); `key` muda a cada jogada */
	animation?: TeamAnimation | null
}>()

defineEmits<{ plus: []; minus: [] }>()

const isOwner = computed(() => variant === 'owner')

// Quem lidera ganha anel na cor do time a 60% (ver teamLook.lead)
// Número e "+N"/"−N" um pouco maiores no visitante, como no design
const floatClass = computed(() =>
	isOwner.value
		? 'top-[34%] right-[14%] text-[56px] [--float-distance:56px]'
		: 'top-[40%] right-[12%] text-[64px] [--float-distance:64px]',
)

const panelStyle = computed(() => ({
	boxShadow: `inset 0 0 0 1px ${status === 'leader' ? look.lead : 'var(--color-raised)'}`,
}))
</script>

<template>
	<section
		:aria-label="name"
		class="relative flex min-w-0 flex-[1_1_380px] flex-col overflow-hidden bg-surface transition-shadow duration-300"
		:class="isOwner ? 'rounded-panel' : 'rounded-screen'"
		:style="panelStyle"
	>
		<div aria-hidden="true" :class="isOwner ? 'h-1.5' : 'h-2'" :style="{ background: look.stripe }" />

		<!-- Animação ao marcar ponto: o painel pisca (só +N) e o "+N"/"−N" sobe e some -->
		<div
			v-if="animation?.flash"
			:key="`flash-${animation.key}`"
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 z-1 animate-score-flash rounded-[inherit] opacity-0"
			:style="{ background: animation.glow, boxShadow: `inset 0 0 0 2px ${animation.glowEdge}` }"
		/>
		<span
			v-if="animation"
			:key="`float-${animation.key}`"
			aria-hidden="true"
			class="pointer-events-none absolute z-2 animate-score-float font-score leading-none font-bold opacity-0"
			:class="floatClass"
			:style="{ color: animation.textColor }"
		>
			{{ animation.text }}
		</span>

		<div
			class="flex flex-1 flex-col"
			:class="isOwner ? 'gap-4 p-[clamp(20px,3vw,32px)]' : 'items-center gap-3 p-[clamp(20px,3vw,36px)]'"
		>
			<div class="flex min-w-0 items-center" :class="isOwner ? 'gap-3.5' : 'max-w-full justify-center gap-3'">
				<TeamMonogram :name="name" :look="look" :size="isOwner ? 48 : 44" />
				<h2
					class="min-w-0 truncate leading-tight font-bold text-white"
					:class="isOwner ? 'flex-1 text-[clamp(20px,2.2vw,30px)]' : 'text-[clamp(20px,2.4vw,34px)]'"
				>
					{{ name }}
				</h2>
				<span
					v-if="status === 'leader'"
					class="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 text-xs font-bold text-canvas"
					:class="isOwner ? 'h-7' : 'h-6.5'"
				>
					Na frente
				</span>
				<span
					v-else-if="!isOwner"
					class="inline-flex h-6.5 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold text-fg-soft ring-1 ring-edge ring-inset"
				>
					{{ status === 'tie' ? 'Empatado' : `${behind} atrás` }}
				</span>
			</div>

			<output
				aria-live="polite"
				class="flex flex-1 items-center justify-center font-score leading-[0.9] font-bold tracking-[-2px] text-white"
				:class="scoreSizeClass(scoreSize, variant)"
			>
				<span
					:key="animation?.key ?? 0"
					class="inline-block"
					:class="animation && (animation.kind === 'up' ? 'animate-score-up' : 'animate-score-down')"
				>
					{{ score }}
				</span>
			</output>

			<div v-if="isOwner" class="flex gap-2.5">
				<button
					type="button"
					:aria-label="`Tirar ${increment} do ${name}`"
					:disabled="score <= 0"
					class="flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-card bg-raised text-white ring-1 ring-edge transition-colors ring-inset hover:bg-edge disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-raised"
					@click="$emit('minus')"
				>
					<UIcon name="i-lucide-minus" class="size-6.5" />
				</button>
				<button
					type="button"
					:aria-label="`Somar ${increment} para ${name}`"
					class="flex h-16 flex-1 cursor-pointer items-center justify-center rounded-card bg-white font-score text-[30px] font-bold text-canvas transition-[background-color,transform] hover:bg-fg active:scale-[0.98]"
					@click="$emit('plus')"
				>
					+{{ increment }}
				</button>
			</div>
		</div>
	</section>
</template>
