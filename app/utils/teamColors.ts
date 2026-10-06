/**
 * Paleta de cores dos times (docs/placar-design/HANDOFF.md, seção de cores).
 * O banco guarda só o id (ex.: 'preto-branco'); a mesma lista está no CHECK da migration
 * 20261006175323_cores_por_id.sql — ao mudar a paleta, crie uma migration nova.
 */

export interface TeamColor {
	id: string
	name: string
	/** Cor principal */
	c1: string
	/** Segunda cor, só nas duplas */
	c2?: string
}

export const TEAM_PALETTE: readonly TeamColor[] = [
	// Sólidas
	{ id: 'azul', name: 'Azul', c1: '#51a2ff' },
	{ id: 'laranja', name: 'Laranja', c1: '#ff8904' },
	{ id: 'verde', name: 'Verde', c1: '#05df72' },
	{ id: 'roxo', name: 'Roxo', c1: '#a684ff' },
	{ id: 'rosa', name: 'Rosa', c1: '#fb64b6' },
	{ id: 'amarelo', name: 'Amarelo', c1: '#fdc700' },
	{ id: 'vermelho', name: 'Vermelho', c1: '#fb2c36' },
	{ id: 'preto', name: 'Preto', c1: '#0a0a0a' },
	// Duplas
	{ id: 'preto-branco', name: 'Preto e branco', c1: '#0a0a0a', c2: '#ffffff' },
	{ id: 'preto-vermelho', name: 'Preto e vermelho', c1: '#0a0a0a', c2: '#fb2c36' },
	{ id: 'amarelo-azul', name: 'Amarelo e azul', c1: '#fdc700', c2: '#155dfc' },
	{ id: 'verde-branco', name: 'Verde e branco', c1: '#00a63e', c2: '#ffffff' },
	{ id: 'azul-branco', name: 'Azul e branco', c1: '#155dfc', c2: '#ffffff' },
	{ id: 'vermelho-branco', name: 'Vermelho e branco', c1: '#e7000b', c2: '#ffffff' },
	{ id: 'verde-amarelo', name: 'Verde e amarelo', c1: '#00a63e', c2: '#fdc700' },
	{ id: 'preto-amarelo', name: 'Preto e amarelo', c1: '#0a0a0a', c2: '#fdc700' },
]

export const SOLID_TEAM_COLORS = TEAM_PALETTE.filter(color => !color.c2)
export const DUAL_TEAM_COLORS = TEAM_PALETTE.filter(color => color.c2)

/** Cores de um placar novo (também são o default das colunas no banco) */
export const DEFAULT_TEAM_COLOR_IDS = { a: 'azul', b: 'laranja' } as const

const BLACK = '#0a0a0a'

export function isTeamColorId(id: string): boolean {
	return TEAM_PALETTE.some(color => color.id === id)
}

/** Como uma cor aparece em cada lugar da interface */
export interface TeamLook {
	id: string
	name: string
	c1: string
	c2: string | null
	dual: boolean
	/** Bolinha do seletor e ponto do histórico */
	dot: string
	/** Faixa no topo de painéis, cards e modais (dupla = listras) */
	stripe: string
	/** Barra lateral de 4px nos cards (dupla = metade de cima c1, metade de baixo c2) */
	bar: string
	/** Fundo do monograma */
	tint: string
	/** Letra do monograma */
	ink: string
	/** Anel do monograma e da barra (só nas cores com c1 preto) */
	edge: string
	/** Anel da bolinha (só nas cores com c1 preto) */
	swEdge: string
	/** Cor do anel do painel do time que lidera */
	lead: string
}

/** Aparência da cor `id`; ids desconhecidos caem no azul, como no design */
export function teamLook(id: string | null | undefined): TeamLook {
	const color = TEAM_PALETTE.find(c => c.id === id) ?? TEAM_PALETTE[0]!
	const { c1, c2 } = color
	const dark = c1 === BLACK

	return {
		id: color.id,
		name: color.name,
		c1,
		c2: c2 ?? null,
		dual: !!c2,
		dot: c2 ? `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)` : c1,
		stripe: c2 ? `repeating-linear-gradient(135deg, ${c1} 0 10px, ${c2} 10px 20px)` : c1,
		bar: c2 ? `linear-gradient(180deg, ${c1} 50%, ${c2} 50%)` : c1,
		// Sólida: cor a ~14% (alfa 24); dupla: c1 sólido; preto sólido: preto
		tint: c2 ? c1 : dark ? BLACK : `${c1}24`,
		ink: c2 ? c2 : dark ? '#ffffff' : c1,
		edge: dark ? 'inset 0 0 0 1px #52525c' : 'none',
		swEdge: dark ? 'inset 0 0 0 1px #71717b' : 'none',
		// Líder: c1 a 60% (alfa 99); com c1 preto usa c2 a 60%, ou cinza no preto sólido
		lead: dark ? (c2 ? `${c2}99` : '#71717b') : `${c1}99`,
	}
}

/** Aparência da cor de um time do placar, com o padrão azul/laranja se não houver cor */
export function teamLookFor(
	placar: { team_a_color?: string | null; team_b_color?: string | null },
	team: 'a' | 'b',
): TeamLook {
	return teamLook((team === 'a' ? placar.team_a_color : placar.team_b_color) || DEFAULT_TEAM_COLOR_IDS[team])
}
