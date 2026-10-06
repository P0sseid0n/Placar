import type { Database } from '~/types/database.types'

type PlacarRow = Database['public']['Tables']['Placar']['Row']
type Team = 'a' | 'b'

/** IDs públicos: 6 caracteres de 0-9 e a-z (gerados em services/placar.ts) */
export const PLACAR_ID_LENGTH = 6

/** Deixa só letras e números, em minúsculas, até 6 caracteres */
export function sanitizePlacarId(raw: string): string {
	return raw
		.replace(/[^a-z0-9]/gi, '')
		.toLowerCase()
		.slice(0, PLACAR_ID_LENGTH)
}

/** Marcador em `error.data.reason` quando /id/[id] não encontra o placar (lido pelo error.vue) */
export const PLACAR_NOT_FOUND = 'placar-nao-encontrado'

export function isValidPlacarId(id: string): boolean {
	return /^[0-9a-z]{6}$/.test(id)
}

/** Tamanho dos números no placar, escolhido nas configurações */
export type ScoreSize = 'P' | 'M' | 'G'

export const SCORE_SIZES: { value: ScoreSize; label: string }[] = [
	{ value: 'P', label: 'Pequeno' },
	{ value: 'M', label: 'Médio' },
	{ value: 'G', label: 'Grande' },
]

/** Nome do time: 1 a 24 caracteres (mesma regra do banco) */
export const TEAM_NAME_MAX_LENGTH = 24

/** Iniciais para o monograma: primeira letra das duas primeiras palavras ("Time Azul" → "TA") */
export function teamInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(word => word[0])
		.join('')
		.toUpperCase()
}

export function firstName(fullName?: string | null): string {
	return fullName?.trim().split(/\s+/)[0] ?? ''
}

export interface ScoreSummary {
	a: number
	b: number
	tie: boolean
	diff: number
	leader: Team | null
	/** "Time Azul por 3" ou "Empate" */
	status: string
	/** "Na frente", "3 atrás" ou "Empatado" */
	tag: Record<Team, string>
}

export function scoreSummary(
	placar: Pick<PlacarRow, 'team_a_name' | 'team_a_score' | 'team_b_name' | 'team_b_score'>,
): ScoreSummary {
	const a = placar.team_a_score ?? 0
	const b = placar.team_b_score ?? 0
	const diff = Math.abs(a - b)
	const leader: Team | null = a === b ? null : a > b ? 'a' : 'b'

	const tagFor = (team: Team) => {
		if (!leader) return 'Empatado'
		return leader === team ? 'Na frente' : `${diff} atrás`
	}

	return {
		a,
		b,
		tie: !leader,
		diff,
		leader,
		status: leader ? `${leader === 'a' ? placar.team_a_name : placar.team_b_name} por ${diff}` : 'Empate',
		tag: { a: tagFor('a'), b: tagFor('b') },
	}
}

/** Tempo relativo curto, no estilo do design: "agora", "há 2 min", "há 3 h", "ontem", "há 3 dias"... */
export function relativeTime(date: string | Date, now: Date = new Date()): string {
	const seconds = Math.max(0, Math.floor((now.getTime() - new Date(date).getTime()) / 1000))
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)

	if (minutes < 1) return 'agora'
	if (hours < 1) return `há ${minutes} min`
	if (days < 1) return `há ${hours} h`
	if (days === 1) return 'ontem'
	if (days < 7) return `há ${days} dias`

	const weeks = Math.floor(days / 7)
	if (days < 30) return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`

	const months = Math.floor(days / 30)
	if (days < 365) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`

	const years = Math.floor(days / 365)
	return `há ${years} ${years === 1 ? 'ano' : 'anos'}`
}

/** Texto do centro do placar: ["Empate"] ou ["Diferença", "3"] */
export function diffLines(a: number, b: number): string[] {
	const diff = Math.abs(a - b)
	return diff === 0 ? ['Empate'] : ['Diferença', String(diff)]
}

/** Variação de uma jogada: "+3" ou "−1" (sinal de menos tipográfico) */
export function formatDelta(delta: number): string {
	return `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`
}

/**
 * Tamanho dos números no placar, por P/M/G (valores do design).
 * As classes ficam escritas por extenso para o Tailwind encontrá-las.
 */
const SCORE_SIZE_CLASSES: Record<'owner' | 'viewer', Record<ScoreSize, string>> = {
	owner: {
		P: 'text-[clamp(88px,10vw,150px)]',
		M: 'text-[clamp(110px,14vw,210px)]',
		G: 'text-[clamp(130px,18vw,280px)]',
	},
	viewer: {
		P: 'text-[clamp(96px,11vw,170px)]',
		M: 'text-[clamp(120px,16vw,240px)]',
		G: 'text-[clamp(140px,21vw,320px)]',
	},
}

export function scoreSizeClass(size: string | null | undefined, variant: 'owner' | 'viewer'): string {
	const valid: ScoreSize = size === 'P' || size === 'M' ? size : 'G'
	return SCORE_SIZE_CLASSES[variant][valid]
}

/**
 * Junta o placar recebido pelo realtime com o que está na tela.
 * Enquanto o dono tem cliques sendo salvos, as pontuações da tela (otimistas) são mantidas,
 * para o número não "voltar"; o resto (nomes, incremento, tamanho, cores) vem do realtime.
 */
export function mergeRealtimePlacar<T extends Pick<PlacarRow, 'team_a_score' | 'team_b_score'>>(
	current: T,
	incoming: T,
	pendingSaves: number,
): T {
	if (pendingSaves > 0) {
		return { ...incoming, team_a_score: current.team_a_score, team_b_score: current.team_b_score }
	}
	return incoming
}

/** Números da aba Perfil: total de placares, soma de todos os pontos e maior pontuação de um time */
export function profileStats(placares: Pick<PlacarRow, 'team_a_score' | 'team_b_score'>[]) {
	return {
		total: placares.length,
		points: placares.reduce((sum, p) => sum + (p.team_a_score ?? 0) + (p.team_b_score ?? 0), 0),
		best: placares.reduce((max, p) => Math.max(max, p.team_a_score ?? 0, p.team_b_score ?? 0), 0),
	}
}

/** "outubro de 2026" (mês por extenso e ano), para "Membro desde …" */
export function monthYear(date: string | Date): string {
	return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(date))
}
