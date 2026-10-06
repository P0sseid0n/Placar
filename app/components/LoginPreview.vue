<script setup lang="ts">
// Prévia decorativa da tela de login: um placar "ao vivo" que soma pontos sozinho.
// Fica parada para quem pede menos movimento no sistema.
const scores = reactive({ a: 12, b: 9 })
const last = ref<'a' | 'b' | null>(null)
const tick = ref(0)

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

	timer = setInterval(() => {
		if (scores.a + scores.b > 40) {
			scores.a = 12
			scores.b = 9
			last.value = null
			return
		}

		const team = Math.random() < 0.55 ? 'a' : 'b'
		scores[team]++
		last.value = team
		tick.value++
	}, 2600)
})

onUnmounted(() => clearInterval(timer))

const colorA = DEFAULT_TEAM_COLORS.a
const colorB = DEFAULT_TEAM_COLORS.b
</script>

<template>
	<div aria-hidden="true" class="overflow-hidden rounded-panel bg-surface shadow-[inset_0_0_0_1px_var(--color-raised),0_24px_60px_rgba(0,0,0,0.35)]">
		<div class="flex h-[5px]">
			<span class="flex-1" :style="{ background: colorA }" />
			<span class="flex-1" :style="{ background: colorB }" />
		</div>
		<div class="flex flex-col gap-3.5 px-6 py-5">
			<div class="flex items-center justify-between">
				<span class="font-id text-[13px] text-fg-soft"><span class="text-faint">#</span>k3x9a2</span>
				<LiveBadge size="sm" />
			</div>
			<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
				<div class="flex min-w-0 items-center gap-2.5">
					<TeamMonogram name="Time Azul" :color="colorA" :size="38" />
					<span class="truncate text-[15px] font-semibold text-white">Time Azul</span>
				</div>
				<div class="flex items-center gap-3.5 font-score text-[64px] font-bold leading-none">
					<span
						:key="last === 'a' ? tick : 'a'"
						class="inline-block"
						:class="[scores.a >= scores.b ? 'text-white' : 'text-fg-soft', last === 'a' && 'animate-score-pop']"
					>
						{{ scores.a }}
					</span>
					<span class="text-[28px] text-faint">:</span>
					<span
						:key="last === 'b' ? tick : 'b'"
						class="inline-block"
						:class="[scores.b >= scores.a ? 'text-white' : 'text-fg-soft', last === 'b' && 'animate-score-pop']"
					>
						{{ scores.b }}
					</span>
				</div>
				<div class="flex min-w-0 items-center justify-end gap-2.5">
					<span class="truncate text-[15px] font-semibold text-white">Time Laranja</span>
					<TeamMonogram name="Time Laranja" :color="colorB" :size="38" />
				</div>
			</div>
		</div>
	</div>
</template>
