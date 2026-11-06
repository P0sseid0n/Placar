<script setup lang="ts">
import type { Directive } from 'vue'

// Textos da home para buscadores e IAs: o conteúdo chega no HTML porque a "/" tem SSR
// (o retorno do login fica em /confirmar, onde o @nuxtjs/supabase desliga o SSR)
const TITLE = 'Placar: placar online ao vivo para qualquer jogo'
const DESCRIPTION =
	'Crie o placar do seu jogo e compartilhe por ID, link ou QR code. Quem assiste vê cada ponto ao vivo, até na TV pelo modo telão. Para futebol, vôlei, truco, jogos de tabuleiro e gincanas.'

useSeoMeta({
	title: TITLE,
	description: DESCRIPTION,
	ogTitle: TITLE,
	ogDescription: DESCRIPTION,
})

const canonicalUrl = useCanonical()

const steps = [
	{
		icon: 'i-lucide-plus',
		title: 'Crie o placar',
		text: 'Entre com o Google ou o Discord e escolha o nome de cada time, as cores e quanto vale cada ponto.',
	},
	{
		icon: 'i-lucide-share-2',
		title: 'Compartilhe',
		text: 'Mande o ID de 6 caracteres, o link ou o QR code para quem vai acompanhar. Ninguém precisa de conta para assistir.',
	},
	{
		icon: 'i-lucide-monitor',
		title: 'Marque os pontos',
		text: 'Cada ponto aparece na hora para quem está assistindo, no celular ou numa TV pelo modo telão.',
	},
]

const faq = [
	{
		question: 'Preciso instalar algum aplicativo?',
		answer: 'Não. O Placar funciona direto no navegador, no celular, no computador ou na TV.',
	},
	{
		question: 'Preciso de conta para assistir a um placar?',
		answer: 'Não. Para assistir, basta o ID de 6 caracteres, o link ou o QR code do placar. A conta, com login pelo Google ou pelo Discord, só é necessária para criar e controlar placares.',
	},
	{
		question: 'Para quais jogos o Placar serve?',
		answer: 'Para qualquer disputa entre dois times ou jogadores: futebol, vôlei, basquete, truco, dominó, jogos de tabuleiro, videogame, quiz e gincanas. Você escolhe os nomes, as cores e quanto vale cada ponto.',
	},
	{
		question: 'Como mostrar o placar na TV ou no projetor?',
		answer: 'Abra o placar no navegador da TV ou de um computador ligado a ela e use o modo telão, que mostra só o placar em tela cheia. O jeito mais rápido de abrir é ler o QR code do placar.',
	},
	{
		question: 'Quem está assistindo vê os pontos na hora?',
		answer: 'Sim. Os pontos aparecem ao vivo, com animação, sem precisar atualizar a página.',
	},
	{
		question: 'Dá para corrigir um ponto marcado errado?',
		answer: 'Sim. Você pode diminuir a pontuação de um time ou usar o Desfazer nas últimas jogadas.',
	},
	{
		question: 'Funciona no celular?',
		answer: 'Sim. O Placar funciona em celulares, tablets e computadores, a partir de telas de 360px.',
	},
]

// Dados estruturados (schema.org) para buscadores e respostas de IA
const siteUrl = useRuntimeConfig().public.siteUrl
useHead({
	script: [
		{
			type: 'application/ld+json',
			innerHTML: JSON.stringify({
				'@context': 'https://schema.org',
				'@graph': [
					{
						'@type': 'WebApplication',
						'@id': `${siteUrl}/#app`,
						name: 'Placar',
						url: canonicalUrl,
						description: DESCRIPTION,
						applicationCategory: 'SportsApplication',
						operatingSystem: 'Qualquer navegador',
						browserRequirements: 'Requer JavaScript',
						inLanguage: 'pt-BR',
						image: `${siteUrl}/og-image.jpg`,
						featureList: [
							'Pontuação ao vivo para quem assiste',
							'Compartilhamento por ID, link ou QR code',
							'Modo telão para TV e projetor',
							'Nomes, cores e valor do ponto personalizáveis',
							'Últimas jogadas com Desfazer',
						],
					},
					{
						'@type': 'FAQPage',
						'@id': `${siteUrl}/#faq`,
						inLanguage: 'pt-BR',
						mainEntity: faq.map(item => ({
							'@type': 'Question',
							name: item.question,
							acceptedAnswer: { '@type': 'Answer', text: item.answer },
						})),
					},
				],
			}),
		},
	],
})

const client = useSupabaseClient()
const user = useSupabaseUser()

// Logado também pode ver a home: o card de entrar vira um atalho para o painel.
// A sessão vem do cookie no SSR, então a página já chega certa, sem piscar o botão de login.
const fullName = computed(() => (user.value?.user_metadata?.full_name as string | undefined) ?? '')
const greetingName = computed(() => firstName(fullName.value))

const signingOut = ref(false)

async function signOut() {
	signingOut.value = true
	await client.auth.signOut()
	signingOut.value = false
}

type Provider = 'google' | 'discord'
const PROVIDER_LABEL: Record<Provider, string> = { google: 'Google', discord: 'Discord' }

// Provedor cujo login está em andamento (mostra o carregando só no botão dele)
const signingIn = ref<Provider | null>(null)

async function signIn(provider: Provider) {
	signingIn.value = provider

	const { error } = await client.auth.signInWithOAuth({
		provider,
		options: { redirectTo: `${window.location.origin}/confirmar` },
	})

	// Em caso de sucesso o navegador sai da página; só volta aqui se der erro
	if (error) {
		signingIn.value = null
		useToast().add({
			color: 'error',
			title: `Não foi possível entrar com o ${PROVIDER_LABEL[provider]}`,
			description: 'Tente novamente.',
		})
	}
}

const placarId = ref('')
const tried = ref(false)

const isComplete = computed(() => isValidPlacarId(placarId.value))
const showError = computed(() => tried.value && !isComplete.value)

const message = computed(() => {
	if (!showError.value) return 'Peça o ID para quem criou o placar.'
	return placarId.value.length === 0 ? 'Digite o ID do placar.' : 'O ID tem 6 letras ou números.'
})

function onIdInput(event: Event) {
	const input = event.target as HTMLInputElement
	placarId.value = sanitizePlacarId(input.value)
	// Mantém o campo igual ao valor limpo mesmo quando a limpeza não muda o ref
	input.value = placarId.value
	tried.value = false
}

const idField = ref<HTMLElement | null>(null)

function prefersReducedMotion() {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Balança o campo quando o ID está incompleto, para o erro chamar atenção
function shakeIdField() {
	if (!idField.value || prefersReducedMotion()) return
	idField.value.animate(
		[
			{ transform: 'translateX(0)' },
			{ transform: 'translateX(-6px)' },
			{ transform: 'translateX(5px)' },
			{ transform: 'translateX(-3px)' },
			{ transform: 'translateX(2px)' },
			{ transform: 'translateX(0)' },
		],
		{ duration: 380, easing: 'ease-out' },
	)
}

function goToPlacar() {
	tried.value = true
	if (isComplete.value) navigateTo(`/id/${placarId.value}`)
	else shakeIdField()
}

// v-reveal: o elemento aparece subindo quando entra na tela ao rolar.
// Só esconde o que ainda está abaixo da tela, e só no cliente: o HTML do SSR (e os buscadores) veem tudo.
// O valor é o atraso em ms, para escalonar itens de uma lista.
const vReveal: Directive<HTMLElement, number | undefined> = {
	mounted(el, { value: delay = 0 }) {
		if (!('IntersectionObserver' in window) || prefersReducedMotion()) return
		if (el.getBoundingClientRect().top < window.innerHeight) return

		el.classList.add('reveal', 'reveal-hidden')
		el.style.transitionDelay = `${delay}ms`

		const observer = new IntersectionObserver(
			entries => {
				if (!entries.some(entry => entry.isIntersecting)) return
				el.classList.remove('reveal-hidden')
				observer.disconnect()
			},
			// Topo enorme: quem pulou a tela de uma vez (Home/End, link âncora) já conta como visto
			{ rootMargin: '100000px 0px -10% 0px' },
		)
		observer.observe(el)
	},
}

// Links da frase de consentimento embaixo do botão de entrar
const consentLink = 'text-fg-soft underline underline-offset-2 hover:text-white'

const highlights = [
	{ icon: 'i-lucide-plus', text: 'Pontos com um clique' },
	{ icon: 'i-lucide-link', text: 'Compartilhe por ID ou link' },
	{ icon: 'i-lucide-monitor', text: 'Modo telão para a TV' },
]
</script>

<template>
	<div class="bg-canvas bg-dots">
		<main>
			<div class="flex min-h-dvh items-center justify-center p-4 py-12 sm:p-12">
				<div class="flex w-full max-w-295 flex-wrap items-center justify-center gap-[clamp(40px,6vw,96px)]">
					<section class="flex max-w-150 min-w-0 flex-[1_1_480px] flex-col gap-8">
						<div class="flex flex-col gap-1">
							<p class="animate-rise text-lg font-medium text-fg/75">Bem-vindo(a) ao</p>
							<AppLogo
								tag="h1"
								fluid
								class="animate-rise text-[clamp(64px,10vw,112px)] tracking-[-2px] [animation-delay:80ms]"
							/>
							<p class="mt-3 max-w-115 animate-rise text-lg text-fg-strong [animation-delay:160ms]">
								Crie o placar do seu jogo em segundos e compartilhe com todo mundo por um ID.
							</p>
						</div>

						<LoginPreview class="animate-rise [animation-delay:260ms] max-[900px]:hidden" />

						<ul class="flex flex-wrap gap-x-6 gap-y-2.5">
							<li
								v-for="(item, index) in highlights"
								:key="item.text"
								class="flex animate-rise items-center gap-2 text-sm text-fg-strong"
								:style="{ animationDelay: `${360 + index * 70}ms` }"
							>
								<UIcon :name="item.icon" class="size-4.5 text-fg-soft" aria-hidden="true" />
								{{ item.text }}
							</li>
						</ul>
					</section>

					<section
						aria-labelledby="entrar"
						class="flex min-w-0 flex-[0_1_420px] animate-rise flex-col rounded-panel bg-surface p-[clamp(24px,3vw,36px)] shadow-[inset_0_0_0_1px_var(--color-raised),0_24px_60px_rgba(0,0,0,0.35)] [animation-delay:200ms]"
					>
						<Transition name="card-swap" mode="out-in">
							<div v-if="user" key="user" class="flex flex-col">
								<h2 id="entrar" class="text-2xl font-bold text-white">
									{{ greetingName ? `Olá, ${greetingName}` : 'Olá!' }}
								</h2>
								<p class="mt-1.5 mb-6 text-[15px] leading-5.5 text-fg-soft">
									Seus placares estão no painel.
								</p>

								<div
									class="mb-3 flex items-center gap-3 rounded-field bg-canvas py-2.5 pr-2.5 pl-3 ring-1 ring-edge ring-inset"
								>
									<UserAvatar :size="36" />
									<div class="flex min-w-0 flex-1 flex-col">
										<span class="text-xs text-fg-dim">Conectado como</span>
										<span class="truncate text-sm font-semibold text-white">{{
											fullName || 'Sua conta'
										}}</span>
									</div>
									<UButton
										color="neutral"
										variant="ghost"
										icon="i-lucide-log-out"
										label="Sair"
										:loading="signingOut"
										class="h-9 shrink-0 gap-1.5 rounded-btn px-3 text-sm font-semibold text-fg-soft hover:bg-raised hover:text-white"
										@click="signOut"
									/>
								</div>

								<UButton
									to="/painel"
									color="neutral"
									variant="solid"
									block
									trailing-icon="i-lucide-arrow-right"
									label="Ir para o painel"
									class="h-13 justify-center gap-2.5 rounded-field text-base font-semibold hover:bg-fg"
								/>
							</div>
							<div v-else key="guest" class="flex flex-col">
								<h2 id="entrar" class="text-2xl font-bold text-white">Entrar</h2>
								<p class="mt-1.5 mb-6 text-[15px] leading-5.5 text-fg-soft">
									Entre para criar e controlar seus placares.
								</p>

								<div class="flex flex-col gap-2.5">
									<UButton
										color="neutral"
										variant="solid"
										block
										label="Entrar com Google"
										:loading="signingIn === 'google'"
										:disabled="signingIn !== null"
										class="h-13 gap-2.5 rounded-field text-base font-semibold hover:bg-fg"
										@click="signIn('google')"
									>
										<template #leading>
											<!-- "G" colorido do Google, como pedem as diretrizes de marca do botão de login -->
											<svg
												v-if="signingIn !== 'google'"
												viewBox="0 0 48 48"
												class="size-5 shrink-0"
												aria-hidden="true"
											>
												<path
													fill="#EA4335"
													d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
												/>
												<path
													fill="#4285F4"
													d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
												/>
												<path
													fill="#FBBC05"
													d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
												/>
												<path
													fill="#34A853"
													d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
												/>
											</svg>
										</template>
									</UButton>
									<UButton
										color="neutral"
										variant="subtle"
										block
										icon="i-simple-icons-discord"
										label="Entrar com Discord"
										:loading="signingIn === 'discord'"
										:disabled="signingIn !== null"
										class="h-13 gap-2.5 rounded-field bg-raised text-base font-semibold text-white ring-edge hover:bg-edge"
										@click="signIn('discord')"
									/>
								</div>
								<p class="mt-3 text-center text-xs leading-4.5 text-fg-dim">
									Ao entrar, você concorda com os
									<NuxtLink to="/termos" :class="consentLink">Termos de Uso</NuxtLink>
									e a
									<NuxtLink to="/privacidade" :class="consentLink">Política de Privacidade</NuxtLink>.
								</p>
							</div>
						</Transition>
						<div role="separator" class="my-7 flex items-center gap-3">
							<span class="h-px flex-1 bg-raised" />
							<span class="text-[13px] font-medium text-fg-soft">ou assista a um placar</span>
							<span class="h-px flex-1 bg-raised" />
						</div>

						<form class="flex flex-col gap-2" novalidate @submit.prevent="goToPlacar">
							<label for="placar-id" class="text-sm font-semibold text-white">ID do placar</label>
							<div
								ref="idField"
								class="flex h-13 items-center gap-1.5 rounded-field bg-canvas py-1.5 pr-1.5 pl-3.5 ring-1 transition-shadow ring-inset"
								:class="showError ? 'ring-error' : 'ring-edge focus-within:ring-fg-soft'"
							>
								<span aria-hidden="true" class="font-id text-[17px] text-faint">#</span>
								<input
									id="placar-id"
									:value="placarId"
									type="text"
									inputmode="text"
									maxlength="6"
									autocomplete="off"
									autocapitalize="off"
									spellcheck="false"
									placeholder="k3x9a2"
									aria-describedby="placar-id-msg"
									:aria-invalid="showError"
									class="h-full min-w-0 flex-1 bg-transparent font-id text-[17px] tracking-[2px] text-white placeholder:text-fg-dim focus:outline-none"
									@input="onIdInput"
								/>
								<span
									class="text-xs tabular-nums transition-colors duration-200"
									:class="isComplete ? 'text-success' : 'text-fg-dim'"
									>{{ placarId.length }}/6</span
								>
								<button
									type="submit"
									aria-label="Abrir placar"
									class="group flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-btn transition-[background-color,color,transform] duration-200 active:scale-95"
									:class="
										isComplete
											? 'bg-white text-canvas hover:bg-fg'
											: 'bg-raised text-fg-soft hover:bg-edge'
									"
								>
									<UIcon
										name="i-lucide-arrow-right"
										class="size-5 transition-transform duration-200 group-hover:translate-x-0.5"
									/>
								</button>
							</div>
							<p
								id="placar-id-msg"
								role="status"
								class="min-h-5 text-[13px] leading-5"
								:class="showError ? 'text-error' : 'text-fg-soft'"
							>
								{{ message }}
							</p>
						</form>
					</section>
				</div>
			</div>

			<!-- Conteúdo em texto para quem chega pela busca (e para buscadores e IAs). Fica abaixo da primeira tela. -->
			<div class="mx-auto flex w-full max-w-295 flex-col gap-[clamp(64px,8vw,104px)] px-4 pt-8 pb-20 sm:px-12">
				<section aria-labelledby="como-funciona" class="flex flex-col gap-8">
					<div v-reveal class="flex max-w-150 flex-col gap-2">
						<h2 id="como-funciona" class="text-[clamp(24px,3vw,32px)] leading-tight font-bold text-white">
							Como funciona o Placar
						</h2>
						<p class="text-base text-fg-soft">
							Um placar online que você controla pelo celular e todo mundo acompanha ao vivo.
						</p>
					</div>

					<ol class="grid gap-4 md:grid-cols-3">
						<li
							v-for="(step, index) in steps"
							:key="step.title"
							v-reveal="index * 110"
							class="flex flex-col gap-3 rounded-card bg-surface p-6 shadow-[inset_0_0_0_1px_var(--color-raised)]"
						>
							<div class="flex items-center justify-between">
								<span class="flex size-10 items-center justify-center rounded-btn bg-raised">
									<UIcon :name="step.icon" class="size-5 text-white" aria-hidden="true" />
								</span>
								<span
									aria-hidden="true"
									class="font-score text-[32px] leading-none font-bold text-faint"
								>
									{{ index + 1 }}
								</span>
							</div>
							<h3 class="text-lg font-semibold text-white">{{ step.title }}</h3>
							<p class="text-[15px] leading-6 text-fg-soft">{{ step.text }}</p>
						</li>
					</ol>
				</section>

				<section aria-labelledby="perguntas" class="flex flex-col gap-8">
					<h2 id="perguntas" v-reveal class="text-[clamp(24px,3vw,32px)] leading-tight font-bold text-white">
						Perguntas frequentes
					</h2>

					<dl class="grid gap-x-12 gap-y-8 md:grid-cols-2">
						<div
							v-for="(item, index) in faq"
							:key="item.question"
							v-reveal="(index % 2) * 90"
							class="flex flex-col gap-2"
						>
							<dt class="text-base font-semibold text-white">{{ item.question }}</dt>
							<dd class="text-[15px] leading-6 text-fg-soft">{{ item.answer }}</dd>
						</div>
					</dl>
				</section>
			</div>
		</main>

		<footer
			class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-raised px-4 py-8 text-sm text-fg-dim"
		>
			<span>© 2026 Placar</span>
			<NuxtLink to="/termos" class="rounded-btn text-fg-soft transition-colors hover:text-white"
				>Termos de Uso</NuxtLink
			>
			<NuxtLink to="/privacidade" class="rounded-btn text-fg-soft transition-colors hover:text-white">
				Política de Privacidade
			</NuxtLink>
			<a :href="`mailto:${CONTACT_EMAIL}`" class="rounded-btn text-fg-soft transition-colors hover:text-white">
				Contato
			</a>
		</footer>
	</div>
</template>
