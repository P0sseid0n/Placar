<script setup lang="ts">
import Services from '~/services'

useHead({
	title: 'Placar',
})

const user = useSupabaseUser()
const greetingName = computed(() => firstName(user.value?.user_metadata?.full_name as string | undefined))

// lazy: ao navegar dentro do app a página abre na hora e mostra o skeleton
const {
	data: placares,
	status,
	refresh,
} = useAsyncData('placares', () => Services.placar.getAll(), { lazy: true })

const createPlacarModal = ref(false)

const loading = computed(() => status.value === 'pending' && !placares.value)
const failed = computed(() => status.value === 'error')
const list = computed(() => placares.value ?? [])

const stats = computed(() => [
	{ label: 'Placares criados', value: list.value.length },
	{
		label: 'Pontos marcados',
		value: list.value.reduce((total, p) => total + (p.team_a_score ?? 0) + (p.team_b_score ?? 0), 0),
	},
	{ label: 'Empatados agora', value: list.value.filter(p => scoreSummary(p).tie).length },
])

// getAll já vem do mais recente para o mais antigo
const latest = computed(() => list.value[0])

const search = ref('')
const order = ref<'recent' | 'oldest' | 'points'>('recent')

const orderOptions = [
	{ value: 'recent', label: 'Mais recentes' },
	{ value: 'oldest', label: 'Mais antigos' },
	{ value: 'points', label: 'Mais pontos' },
] as const

const filtered = computed(() => {
	const query = search.value.trim().toLowerCase().replace(/^#/, '')
	const matches = list.value.filter(
		p =>
			!query ||
			p.public_id.includes(query) ||
			p.team_a_name.toLowerCase().includes(query) ||
			p.team_b_name.toLowerCase().includes(query),
	)

	const points = (p: (typeof matches)[number]) => (p.team_a_score ?? 0) + (p.team_b_score ?? 0)

	if (order.value === 'oldest') return [...matches].reverse()
	if (order.value === 'points') return [...matches].sort((a, b) => points(b) - points(a))
	return matches
})
</script>

<template>
	<div class="min-h-screen bg-canvas text-fg">
		<CreatePlacarModal v-model="createPlacarModal" />
		<PainelHeader />

		<main class="mx-auto flex max-w-7xl flex-col gap-10 px-[clamp(16px,5vw,64px)] pt-10 pb-20">
			<section class="flex flex-wrap items-end justify-between gap-5">
				<div class="flex flex-col gap-1.5">
					<p class="text-sm font-medium text-fg-soft">Seu painel</p>
					<h1 class="text-[clamp(30px,4vw,40px)] leading-[1.1] font-bold tracking-[-0.5px] text-white">
						{{ greetingName ? `Olá, ${greetingName}` : 'Olá!' }}
					</h1>
				</div>
				<UButton
					color="neutral"
					variant="solid"
					icon="i-lucide-plus"
					label="Criar placar"
					class="h-12 gap-2 rounded-btn pr-5 pl-4 text-[15px] font-semibold hover:bg-fg"
					:ui="{ leadingIcon: 'size-5' }"
					@click="createPlacarModal = true"
				/>
			</section>

			<PainelCarregando v-if="loading" />

			<PainelErro v-else-if="failed && !placares" @retry="refresh()" />

			<PainelVazio v-else-if="!list.length" @create="createPlacarModal = true" />

			<template v-else>
				<section aria-label="Resumo" class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
					<div
						v-for="stat in stats"
						:key="stat.label"
						class="flex flex-col gap-1 rounded-card bg-surface p-5 ring-1 ring-inset ring-raised"
					>
						<span class="text-[13px] font-medium text-fg-soft">{{ stat.label }}</span>
						<span class="font-score text-[44px] leading-none font-bold text-white">{{ stat.value }}</span>
					</div>
				</section>

				<section v-if="latest" aria-labelledby="ultimo" class="flex flex-col gap-3.5">
					<h2 id="ultimo" class="text-base font-semibold text-white">Continuar de onde parou</h2>
					<PlacarDestaque :placar="latest" />
				</section>

				<section aria-labelledby="todos" class="flex flex-col gap-4">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<h2 id="todos" class="text-base font-semibold text-white">
							Todos os placares <span class="font-medium text-fg-dim">{{ filtered.length }}</span>
						</h2>

						<div class="flex flex-[0_1_420px] flex-wrap gap-2">
							<label for="busca" class="sr-only">Buscar placar</label>
							<div
								class="flex h-11 flex-[1_1_220px] items-center gap-2 rounded-btn bg-surface px-3 text-fg-soft ring-1 ring-inset ring-raised focus-within:ring-fg-dim"
							>
								<UIcon name="i-lucide-search" class="size-[18px] shrink-0" aria-hidden="true" />
								<input
									id="busca"
									v-model="search"
									type="search"
									placeholder="Buscar por time ou ID"
									class="h-full min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-fg-soft focus:outline-none"
								/>
							</div>

							<label for="ordem" class="sr-only">Ordenar</label>
							<select
								id="ordem"
								v-model="order"
								class="h-11 shrink-0 cursor-pointer rounded-btn bg-surface px-3 text-sm text-fg ring-1 ring-inset ring-raised"
							>
								<option v-for="option in orderOptions" :key="option.value" :value="option.value">
									{{ option.label }}
								</option>
							</select>
						</div>
					</div>

					<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
						<li v-for="placar in filtered" :key="placar.id">
							<PlacarItem :placar="placar" />
						</li>
						<li>
							<button
								type="button"
								class="flex h-full min-h-49 w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-card text-fg-soft ring-1 ring-inset ring-edge transition-[box-shadow,color] hover:text-white hover:ring-fg-dim"
								@click="createPlacarModal = true"
							>
								<span aria-hidden="true" class="flex size-11 items-center justify-center rounded-full ring-1 ring-inset ring-edge">
									<UIcon name="i-lucide-plus" class="size-[22px]" />
								</span>
								<span class="text-sm font-semibold">Novo placar</span>
							</button>
						</li>
					</ul>

					<p v-if="!filtered.length" role="status" class="mt-2 text-sm text-fg-soft">
						Nenhum placar encontrado para “{{ search }}”.
					</p>
				</section>
			</template>
		</main>
	</div>
</template>
