<script setup lang="ts">
import * as z from 'zod'
import Services from '~/services'

const toast = useToast()

const model = defineModel<boolean>()

const schema = z.object({
	teamA: z.string().trim().min(1, 'Nome do time A é obrigatório').max(TEAM_NAME_MAX_LENGTH),
	teamB: z.string().trim().min(1, 'Nome do time B é obrigatório').max(TEAM_NAME_MAX_LENGTH),
	score: z.number().min(1, 'O valor da pontuação deve ser maior que 0'),
})

const initialState = () => ({
	teamA: '',
	teamB: '',
	colorA: DEFAULT_TEAM_COLOR_IDS.a as string,
	colorB: DEFAULT_TEAM_COLOR_IDS.b as string,
	score: 1,
})

const state = reactive(initialState())
const tried = ref(false)
const loading = ref(false)

// Os erros aparecem depois da primeira tentativa e somem assim que o campo fica válido
const errors = computed(() => {
	if (!tried.value) return {}
	const result = schema.safeParse(state)
	if (result.success) return {}
	return Object.fromEntries(result.error.issues.map(issue => [issue.path[0], issue.message])) as Partial<
		Record<'teamA' | 'teamB' | 'score', string>
	>
})

// Ao fechar (Cancelar, X ou Esc), o formulário volta ao início
watch(model, open => {
	if (!open) {
		Object.assign(state, initialState())
		tried.value = false
	}
})

const lookA = computed(() => teamLook(state.colorA))
const lookB = computed(() => teamLook(state.colorB))

const preview = computed(() => ({
	a: state.teamA.trim(),
	b: state.teamB.trim(),
}))

async function onSubmit() {
	tried.value = true
	const result = schema.safeParse(state)
	if (!result.success) return

	loading.value = true

	try {
		const placarId = await Services.placar.create({
			score: result.data.score,
			teamA: result.data.teamA,
			teamB: result.data.teamB,
			colorA: state.colorA,
			colorB: state.colorB,
		})
		model.value = false
		await navigateTo(`/id/${placarId}`)
	} catch (error) {
		console.error(error)
		toast.add({
			color: 'error',
			title: 'Erro ao criar placar',
			description: (error as Error).message || 'Ocorreu um erro ao criar o placar. Tente novamente mais tarde.',
		})
	} finally {
		loading.value = false
	}
}

const fields = [
	{
		team: 'A',
		legend: 'Primeiro time',
		label: 'Nome do primeiro time',
		placeholder: 'Time 1',
		name: 'teamA',
		color: 'colorA',
		other: 'colorB',
	},
	{
		team: 'B',
		legend: 'Segundo time',
		label: 'Nome do segundo time',
		placeholder: 'Time 2',
		name: 'teamB',
		color: 'colorB',
		other: 'colorA',
	},
] as const
</script>

<template>
	<UModal
		v-model:open="model"
		title="Novo placar"
		description="Defina os times e quanto vale cada ponto."
		:dismissible="!loading"
		:ui="{ content: 'max-w-[640px] overflow-hidden' }"
	>
		<template #content="{ close }">
			<form novalidate class="flex min-h-0 flex-1 flex-col" @submit.prevent="onSubmit">
				<div aria-hidden="true" class="flex h-1.25 shrink-0">
					<span class="flex-1 transition-colors" :style="{ background: lookA.stripe }" />
					<span class="flex-1 transition-colors" :style="{ background: lookB.stripe }" />
				</div>

				<div class="flex shrink-0 items-start justify-between gap-4 px-7 pt-6 max-sm:px-5">
					<div class="flex flex-col gap-1">
						<h2 class="text-2xl font-bold text-white">Novo placar</h2>
						<p class="text-[15px] text-fg-soft">Defina os times e quanto vale cada ponto.</p>
					</div>
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-lucide-x"
						aria-label="Fechar"
						:disabled="loading"
						class="size-10 shrink-0 justify-center rounded-btn text-fg-soft hover:bg-raised hover:text-white"
						:ui="{ leadingIcon: 'size-5' }"
						@click="close"
					/>
				</div>

				<div class="flex min-h-0 flex-col gap-6 overflow-y-auto px-7 py-6 max-sm:px-5">
					<!-- Prévia ao vivo -->
					<div
						aria-hidden="true"
						class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 rounded-feature bg-canvas px-5 py-4 ring-1 ring-raised ring-inset max-sm:gap-2 max-sm:px-3"
					>
						<div class="flex min-w-0 items-center gap-2.5">
							<TeamMonogram :name="preview.a || 'T 1'" :look="lookA" :size="40" class="max-sm:hidden" />
							<span
								class="truncate text-[15px] font-semibold"
								:class="preview.a ? 'text-white' : 'text-fg-dim'"
							>
								{{ preview.a || 'Time 1' }}
							</span>
						</div>
						<span class="font-score text-[44px] leading-none font-bold text-white"
							>0 <span class="text-faint">:</span> 0</span
						>
						<div class="flex min-w-0 items-center justify-end gap-2.5">
							<span
								class="truncate text-[15px] font-semibold"
								:class="preview.b ? 'text-white' : 'text-fg-dim'"
							>
								{{ preview.b || 'Time 2' }}
							</span>
							<TeamMonogram :name="preview.b || 'T 2'" :look="lookB" :size="40" class="max-sm:hidden" />
						</div>
					</div>

					<!-- Times -->
					<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
						<fieldset v-for="field in fields" :key="field.team" class="flex min-w-0 flex-col gap-2">
							<legend class="mb-2 text-sm font-semibold text-white">{{ field.legend }}</legend>
							<label :for="`time-${field.team}`" class="sr-only">{{ field.label }}</label>
							<input
								:id="`time-${field.team}`"
								v-model="state[field.name]"
								type="text"
								:maxlength="TEAM_NAME_MAX_LENGTH"
								:placeholder="field.placeholder"
								:disabled="loading"
								:aria-invalid="!!errors[field.name]"
								:aria-describedby="`time-${field.team}-erro`"
								class="h-12 rounded-field bg-canvas px-3.5 text-base text-white ring-1 ring-inset placeholder:text-fg-dim focus:outline-none disabled:opacity-60"
								:class="errors[field.name] ? 'ring-error' : 'ring-edge focus:ring-fg-soft'"
							/>
							<TeamColorPicker
								v-model="state[field.color]"
								:taken="state[field.other]"
								:label="`Cor do ${field.legend.toLowerCase()}`"
								:align="field.team === 'A' ? 'start' : 'end'"
								:disabled="loading"
							/>
							<span :id="`time-${field.team}-erro`" class="min-h-5 text-[13px] leading-5 text-error">
								{{ errors[field.name] }}
							</span>
						</fieldset>
					</div>

					<!-- Valor da pontuação -->
					<div class="flex flex-wrap items-center justify-between gap-4 border-t border-raised pt-5">
						<div class="flex flex-col gap-0.5">
							<span id="novo-inc-label" class="text-sm font-semibold text-white">Valor da pontuação</span>
							<span class="text-[13px] text-fg-soft">Pontos somados a cada clique</span>
						</div>
						<ScoreStepper v-model="state.score" labelledby="novo-inc-label" :disabled="loading" />
					</div>
				</div>

				<div class="flex shrink-0 justify-end gap-2 border-t border-raised bg-canvas px-7 py-4 max-sm:px-5">
					<UButton
						type="button"
						color="neutral"
						variant="ghost"
						label="Cancelar"
						:disabled="loading"
						class="h-12 rounded-field px-4.5 text-[15px] font-semibold text-fg-strong hover:bg-raised hover:text-white"
						@click="close"
					/>
					<UButton
						type="submit"
						color="neutral"
						variant="solid"
						label="Criar placar"
						trailing-icon="i-lucide-arrow-right"
						:loading="loading"
						class="h-12 gap-2 rounded-field px-5 text-[15px] font-semibold hover:bg-fg"
					/>
				</div>
			</form>
		</template>
	</UModal>
</template>
