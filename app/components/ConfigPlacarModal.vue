<script setup lang="ts">
import * as z from 'zod'
import Services from '~/services'
import type { PlacarSettings } from '~/services/placar'
import type { Database } from '~/types/database.types'
import type { ScoreSize } from '~/utils/placar'

const model = defineModel<boolean>()
const { placar } = defineProps<{
	placar: Database['public']['Tables']['Placar']['Row']
}>()
const emit = defineEmits<{
	saved: [settings: PlacarSettings]
	reset: []
	deleted: []
}>()

const toast = useToast()

const schema = z.object({
	teamA: z.string().trim().min(1, 'Nome do time A é obrigatório').max(TEAM_NAME_MAX_LENGTH),
	teamB: z.string().trim().min(1, 'Nome do time B é obrigatório').max(TEAM_NAME_MAX_LENGTH),
	score: z.number().min(1, 'O valor da pontuação deve ser maior que 0'),
	scoreSize: z.enum(['P', 'M', 'G']),
})

const fromPlacar = (): PlacarSettings => ({
	teamA: placar.team_a_name,
	teamB: placar.team_b_name,
	score: placar.score_increment,
	scoreSize: (placar.score_size as ScoreSize) ?? 'G',
})

const draft = reactive<PlacarSettings>(fromPlacar())
const tried = ref(false)
const saving = ref(false)

/** Reiniciar e apagar pedem confirmação no próprio lugar */
const step = ref<'idle' | 'reset' | 'resetting' | 'resetDone' | 'delete' | 'deleting'>('idle')
const busy = computed(() => saving.value || step.value === 'resetting' || step.value === 'deleting')

// Cada vez que abre, começa com os valores atuais do placar
watch(model, open => {
	if (open) {
		Object.assign(draft, fromPlacar())
		tried.value = false
		step.value = 'idle'
	}
})

const errors = computed(() => {
	if (!tried.value) return {}
	const result = schema.safeParse(draft)
	if (result.success) return {}
	return Object.fromEntries(result.error.issues.map(issue => [issue.path[0], issue.message])) as Partial<
		Record<'teamA' | 'teamB', string>
	>
})

const colorA = computed(() => teamColor(placar, 'a'))
const colorB = computed(() => teamColor(placar, 'b'))

const sizePreview: Record<ScoreSize, string> = { P: 'text-[22px]', M: 'text-[30px]', G: 'text-[40px]' }

async function save() {
	tried.value = true
	const result = schema.safeParse(draft)
	if (!result.success) return

	saving.value = true
	try {
		await Services.placar.updateSettings(placar.public_id, result.data)
		emit('saved', result.data)
		toast.add({ color: 'success', title: 'Alterações salvas' })
		model.value = false
	} catch (error) {
		console.error(error)
		toast.add({ color: 'error', title: 'Não foi possível salvar', description: 'Tente novamente.' })
	} finally {
		saving.value = false
	}
}

async function confirmReset() {
	step.value = 'resetting'
	try {
		await Services.placar.resetScore(placar.public_id)
		emit('reset')
		step.value = 'resetDone'
	} catch (error) {
		console.error(error)
		step.value = 'idle'
		toast.add({ color: 'error', title: 'Não foi possível zerar o placar', description: 'Tente novamente.' })
	}
}

async function confirmDelete() {
	step.value = 'deleting'
	try {
		await Services.placar.deletePlacar(placar.public_id)
		toast.add({ color: 'success', title: 'Placar apagado' })
		model.value = false
		emit('deleted')
	} catch (error) {
		console.error(error)
		step.value = 'idle'
		toast.add({ color: 'error', title: 'Não foi possível apagar o placar', description: 'Tente novamente.' })
	}
}

const teams = [
	{ key: 'A', field: 'teamA', label: 'Nome do primeiro time' },
	{ key: 'B', field: 'teamB', label: 'Nome do segundo time' },
] as const
</script>

<template>
	<UModal
		v-model:open="model"
		title="Configurações"
		:description="`${placar.team_a_name} x ${placar.team_b_name} · #${placar.public_id}`"
		:dismissible="!busy"
		:ui="{ content: 'max-w-[560px] overflow-hidden' }"
	>
		<template #content="{ close }">
			<form novalidate class="flex min-h-0 flex-1 flex-col" @submit.prevent="save">
				<div aria-hidden="true" class="flex h-[5px] shrink-0">
					<span class="flex-1" :style="{ background: colorA }" />
					<span class="flex-1" :style="{ background: colorB }" />
				</div>

				<div
					class="flex shrink-0 items-start justify-between gap-4 border-b border-raised px-7 pt-[22px] pb-[18px] max-sm:px-5"
				>
					<div class="flex min-w-0 flex-col gap-1">
						<h2 class="text-2xl font-bold text-white">Configurações</h2>
						<span class="truncate text-sm text-fg-soft">
							{{ placar.team_a_name }} x {{ placar.team_b_name }} ·
							<span class="font-id text-fg-strong">#{{ placar.public_id }}</span>
						</span>
					</div>
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-lucide-x"
						aria-label="Fechar"
						:disabled="busy"
						class="size-10 shrink-0 justify-center rounded-btn text-fg-soft hover:bg-raised hover:text-white"
						:ui="{ leadingIcon: 'size-5' }"
						@click="close"
					/>
				</div>

				<div class="flex min-h-0 flex-col gap-[26px] overflow-y-auto px-7 py-6 max-sm:px-5">
					<!-- Times -->
					<fieldset class="flex flex-col gap-2.5">
						<legend class="mb-2.5 text-sm font-semibold text-white">Times</legend>
						<div v-for="team in teams" :key="team.key" class="flex flex-col gap-1">
							<div class="flex items-center gap-2.5">
								<TeamMonogram
									:name="draft[team.field] || (team.key === 'A' ? 'T 1' : 'T 2')"
									:color="team.key === 'A' ? colorA : colorB"
									:size="44"
								/>
								<label :for="`cfg-${team.key}`" class="sr-only">{{ team.label }}</label>
								<input
									:id="`cfg-${team.key}`"
									v-model="draft[team.field]"
									type="text"
									:maxlength="TEAM_NAME_MAX_LENGTH"
									:disabled="busy"
									:aria-invalid="!!errors[team.field]"
									:aria-describedby="`cfg-${team.key}-erro`"
									class="h-11 min-w-0 flex-1 rounded-field bg-canvas px-3.5 text-[15px] text-white ring-1 ring-inset placeholder:text-fg-dim focus:outline-none disabled:opacity-60"
									:class="errors[team.field] ? 'ring-error' : 'ring-edge focus:ring-fg-soft'"
								/>
							</div>
							<span
								v-if="errors[team.field]"
								:id="`cfg-${team.key}-erro`"
								class="pl-[54px] text-[13px] leading-5 text-error"
							>
								{{ errors[team.field] }}
							</span>
						</div>
					</fieldset>

					<!-- Pontuação por clique -->
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div class="flex flex-col gap-0.5">
							<span id="cfg-inc-label" class="text-sm font-semibold text-white"
								>Pontuação por clique</span
							>
							<span class="text-[13px] text-fg-soft">Vale para os dois times</span>
						</div>
						<ScoreStepper v-model="draft.score" size="md" labelledby="cfg-inc-label" :disabled="busy" />
					</div>

					<!-- Tamanho dos números -->
					<fieldset>
						<legend class="mb-2.5 text-sm font-semibold text-white">Tamanho dos números</legend>
						<div
							role="radiogroup"
							class="grid grid-cols-3 gap-1 rounded-card bg-canvas p-1 ring-1 ring-raised ring-inset"
						>
							<button
								v-for="size in SCORE_SIZES"
								:key="size.value"
								type="button"
								role="radio"
								:aria-checked="draft.scoreSize === size.value"
								:disabled="busy"
								class="flex h-[76px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-btn transition-colors"
								:class="
									draft.scoreSize === size.value
										? 'bg-white text-canvas'
										: 'text-fg-soft hover:text-white'
								"
								@click="draft.scoreSize = size.value"
							>
								<span
									aria-hidden="true"
									class="font-score leading-none font-bold"
									:class="sizePreview[size.value]"
									>12</span
								>
								<span class="text-xs font-semibold">{{ size.label }}</span>
							</button>
						</div>
					</fieldset>

					<div class="flex flex-col gap-3 border-t border-raised pt-[22px]">
						<!-- Reiniciar -->
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div class="flex flex-col gap-0.5">
								<span class="text-sm font-semibold text-white">Reiniciar placar</span>
								<span class="text-[13px] text-fg-soft">Volta os dois times para 0.</span>
							</div>

							<span
								v-if="step === 'resetDone'"
								role="status"
								class="inline-flex items-center gap-2 text-sm font-semibold text-success"
							>
								<UIcon name="i-lucide-circle-check" class="size-[18px]" aria-hidden="true" />
								Placar zerado
							</span>
							<div v-else-if="step === 'reset' || step === 'resetting'" class="flex items-center gap-1.5">
								<UButton
									type="button"
									color="neutral"
									variant="ghost"
									label="Cancelar"
									:disabled="step === 'resetting'"
									class="h-11 rounded-field px-3 text-sm font-semibold text-fg-strong hover:bg-raised hover:text-white"
									@click="step = 'idle'"
								/>
								<UButton
									type="button"
									color="neutral"
									variant="solid"
									label="Zerar placar"
									:loading="step === 'resetting'"
									class="h-11 rounded-field px-3.5 text-sm font-semibold hover:bg-fg"
									@click="confirmReset"
								/>
							</div>
							<UButton
								v-else
								type="button"
								color="neutral"
								variant="subtle"
								icon="i-lucide-rotate-ccw"
								label="Reiniciar"
								:disabled="busy"
								class="h-11 gap-2 rounded-field bg-raised px-3.5 text-sm font-semibold text-fg ring-edge hover:bg-edge"
								@click="step = 'reset'"
							/>
						</div>

						<!-- Apagar (zona de perigo) -->
						<div
							class="flex flex-wrap items-center justify-between gap-3 rounded-card bg-error/5 p-4 ring-1 ring-error/30 ring-inset"
						>
							<div class="flex flex-[1_1_220px] flex-col gap-0.5">
								<span class="text-sm font-semibold text-error">Apagar placar</span>
								<span class="text-[13px] leading-[19px] text-fg-soft"
									>O placar e o ID deixam de existir. Não dá para desfazer.</span
								>
							</div>

							<div v-if="step === 'delete' || step === 'deleting'" class="flex items-center gap-1.5">
								<UButton
									type="button"
									color="neutral"
									variant="ghost"
									label="Cancelar"
									:disabled="step === 'deleting'"
									class="h-11 rounded-field px-3 text-sm font-semibold text-fg-strong hover:bg-raised hover:text-white"
									@click="step = 'idle'"
								/>
								<UButton
									type="button"
									color="error"
									variant="solid"
									label="Sim, apagar"
									:loading="step === 'deleting'"
									class="h-11 rounded-field bg-error px-3.5 text-sm font-bold text-canvas hover:bg-[#ff8183]"
									@click="confirmDelete"
								/>
							</div>
							<UButton
								v-else
								type="button"
								color="error"
								variant="ghost"
								icon="i-lucide-trash-2"
								label="Apagar"
								:disabled="busy"
								class="h-11 gap-2 rounded-field px-3.5 text-sm font-semibold text-error ring-1 ring-error/40 ring-inset hover:bg-error/12"
								@click="step = 'delete'"
							/>
						</div>
					</div>
				</div>

				<div class="flex shrink-0 justify-end gap-2 border-t border-raised bg-canvas px-7 py-4 max-sm:px-5">
					<UButton
						type="button"
						color="neutral"
						variant="ghost"
						label="Cancelar"
						:disabled="busy"
						class="h-12 rounded-field px-[18px] text-[15px] font-semibold text-fg-strong hover:bg-raised hover:text-white"
						@click="close"
					/>
					<UButton
						type="submit"
						color="neutral"
						variant="solid"
						label="Salvar alterações"
						:loading="saving"
						:disabled="busy && !saving"
						class="h-12 rounded-field px-5 text-[15px] font-semibold hover:bg-fg"
					/>
				</div>
			</form>
		</template>
	</UModal>
</template>
