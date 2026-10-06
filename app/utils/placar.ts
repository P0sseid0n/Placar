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

/** Cores padrão do handoff, usadas enquanto o placar não tem cor própria */
export const DEFAULT_TEAM_COLORS: Record<Team, string> = {
	a: '#51a2ff',
	b: '#ff8904',
}

/** Cor do time; as colunas team_a_color / team_b_color chegam na migration da etapa 4 */
export function teamColor(placar: object, team: Team): string {
	const color = (placar as Partial<Record<`team_${Team}_color`, string | null>>)[`team_${team}_color`]
	return color || DEFAULT_TEAM_COLORS[team]
}

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

export function scoreSummary(placar: Pick<PlacarRow, 'team_a_name' | 'team_a_score' | 'team_b_name' | 'team_b_score'>): ScoreSummary {
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
