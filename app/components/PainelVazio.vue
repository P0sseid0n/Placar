<script setup lang="ts">
defineEmits<{ create: [] }>()

const steps = [
	{ title: 'Crie', text: 'o placar com os nomes e as cores dos times.' },
	{ title: 'Compartilhe', text: 'o ID ou o link com quem vai assistir.' },
	{ title: 'Marque', text: 'os pontos e todo mundo vê na hora.' },
]
</script>

<template>
	<section
		aria-labelledby="vazio-titulo"
		class="flex flex-col items-center gap-6 rounded-panel border border-dashed border-edge bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[20px_20px] px-[clamp(20px,4vw,48px)] py-[clamp(32px,6vw,64px)] text-center"
	>
		<div
			aria-hidden="true"
			class="flex items-center gap-5 rounded-feature bg-surface px-[22px] py-[18px] shadow-[inset_0_0_0_1px_var(--color-raised),0_20px_50px_rgba(0,0,0,0.35)]"
		>
			<span class="flex size-11 items-center justify-center rounded-card border border-dashed border-faint text-lg font-bold text-fg-dim">?</span>
			<span class="font-score text-[56px] leading-none font-bold text-faint">0 : 0</span>
			<span class="flex size-11 items-center justify-center rounded-card border border-dashed border-faint text-lg font-bold text-fg-dim">?</span>
		</div>

		<div class="flex flex-col items-center gap-2">
			<h2 id="vazio-titulo" class="text-2xl font-bold text-white">Nenhum placar criado ainda</h2>
			<p class="max-w-[420px] text-base text-fg-soft">
				Crie seu primeiro placar e compartilhe o ID com quem vai acompanhar o jogo.
			</p>
		</div>

		<UButton
			color="neutral"
			variant="solid"
			icon="i-lucide-plus"
			label="Criar primeiro placar"
			class="h-[52px] gap-2 rounded-field px-[22px] text-base font-semibold hover:bg-fg"
			@click="$emit('create')"
		/>

		<ol class="mt-2 grid w-full max-w-[760px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 text-left">
			<li
				v-for="(step, index) in steps"
				:key="step.title"
				class="flex items-start gap-3 rounded-card bg-surface p-4 ring-1 ring-inset ring-raised"
			>
				<span
					aria-hidden="true"
					class="flex size-7 shrink-0 items-center justify-center rounded-full bg-raised font-score text-lg font-bold text-white"
				>
					{{ index + 1 }}
				</span>
				<span class="text-sm text-fg-strong">
					<strong class="font-semibold text-white">{{ step.title }}</strong> {{ step.text }}
				</span>
			</li>
		</ol>
	</section>
</template>
