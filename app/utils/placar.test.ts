import { describe, expect, it } from 'vitest'
import {
	diffLines,
	firstName,
	formatDelta,
	mergeRealtimePlacar,
	scoreSizeClass,
	isValidPlacarId,
	relativeTime,
	sanitizePlacarId,
	scoreSummary,
	teamColor,
	teamInitials,
} from './placar'

describe('sanitizePlacarId', () => {
	it('deixa só letras e números, em minúsculas', () => {
		expect(sanitizePlacarId('#K3x-9 a2')).toBe('k3x9a2')
	})

	it('corta em 6 caracteres', () => {
		expect(sanitizePlacarId('abcdefgh')).toBe('abcdef')
	})

	it('remove acentos e símbolos', () => {
		expect(sanitizePlacarId('ção!@')).toBe('o')
	})
})

describe('isValidPlacarId', () => {
	it('aceita 6 caracteres de 0-9 e a-z', () => {
		expect(isValidPlacarId('k3x9a2')).toBe(true)
	})

	it.each(['k3x9a', 'k3x9a22', 'K3X9A2', 'k3x9a!', ''])('recusa "%s"', id => {
		expect(isValidPlacarId(id)).toBe(false)
	})
})

describe('teamColor', () => {
	it('usa a cor do placar quando existe', () => {
		expect(teamColor({ team_a_color: '#05df72' }, 'a')).toBe('#05df72')
	})

	it('usa azul e laranja como padrão', () => {
		expect(teamColor({}, 'a')).toBe('#51a2ff')
		expect(teamColor({ team_b_color: null }, 'b')).toBe('#ff8904')
	})
})

describe('teamInitials', () => {
	it.each([
		['Time Azul', 'TA'],
		['equipe a', 'EA'],
		['Nós', 'N'],
		['  São   Paulo FC ', 'SP'],
	])('"%s" → "%s"', (name, initials) => {
		expect(teamInitials(name)).toBe(initials)
	})
})

describe('firstName', () => {
	it('pega o primeiro nome', () => {
		expect(firstName('Matheus Possidonio')).toBe('Matheus')
	})

	it('aceita vazio', () => {
		expect(firstName(undefined)).toBe('')
	})
})

describe('scoreSummary', () => {
	const base = { team_a_name: 'Time Azul', team_b_name: 'Time Laranja' }

	it('descreve quem está na frente', () => {
		const summary = scoreSummary({ ...base, team_a_score: 12, team_b_score: 9 })

		expect(summary.leader).toBe('a')
		expect(summary.status).toBe('Time Azul por 3')
		expect(summary.tag).toEqual({ a: 'Na frente', b: '3 atrás' })
	})

	it('descreve empate', () => {
		const summary = scoreSummary({ ...base, team_a_score: 3, team_b_score: 3 })

		expect(summary.tie).toBe(true)
		expect(summary.status).toBe('Empate')
		expect(summary.tag).toEqual({ a: 'Empatado', b: 'Empatado' })
	})

	it('trata pontuação nula como 0', () => {
		const summary = scoreSummary({ ...base, team_a_score: null, team_b_score: 2 })

		expect(summary).toMatchObject({ a: 0, b: 2, leader: 'b', status: 'Time Laranja por 2' })
	})
})

describe('relativeTime', () => {
	const now = new Date('2026-10-06T12:00:00Z')
	const ago = (ms: number) => new Date(now.getTime() - ms)
	const MIN = 60_000
	const HOUR = 60 * MIN
	const DAY = 24 * HOUR

	it.each([
		[30_000, 'agora'],
		[2 * MIN, 'há 2 min'],
		[3 * HOUR, 'há 3 h'],
		[DAY + HOUR, 'ontem'],
		[3 * DAY, 'há 3 dias'],
		[7 * DAY, 'há 1 semana'],
		[15 * DAY, 'há 2 semanas'],
		[40 * DAY, 'há 1 mês'],
		[90 * DAY, 'há 3 meses'],
		[400 * DAY, 'há 1 ano'],
	])('%i ms atrás → "%s"', (ms, text) => {
		expect(relativeTime(ago(ms), now)).toBe(text)
	})

	it('não mostra tempo negativo para datas no futuro', () => {
		expect(relativeTime(new Date(now.getTime() + MIN), now)).toBe('agora')
	})
})

describe('diffLines', () => {
	it('mostra a diferença', () => {
		expect(diffLines(12, 9)).toEqual(['Diferença', '3'])
		expect(diffLines(2, 7)).toEqual(['Diferença', '5'])
	})

	it('mostra empate', () => {
		expect(diffLines(4, 4)).toEqual(['Empate'])
	})
})

describe('formatDelta', () => {
	it('usa + para pontos somados e − (menos tipográfico) para pontos tirados', () => {
		expect(formatDelta(3)).toBe('+3')
		expect(formatDelta(-1)).toBe('−1')
	})
})

describe('scoreSizeClass', () => {
	it('usa os tamanhos do design para dono e visitante', () => {
		expect(scoreSizeClass('P', 'owner')).toBe('text-[clamp(88px,10vw,150px)]')
		expect(scoreSizeClass('M', 'viewer')).toBe('text-[clamp(120px,16vw,240px)]')
	})

	it('cai no Grande para valores desconhecidos', () => {
		expect(scoreSizeClass(null, 'owner')).toBe('text-[clamp(130px,18vw,280px)]')
		expect(scoreSizeClass('X', 'viewer')).toBe('text-[clamp(140px,21vw,320px)]')
	})
})

describe('mergeRealtimePlacar', () => {
	const current = { team_a_score: 7, team_b_score: 2, team_a_name: 'Casa' }
	const incoming = { team_a_score: 6, team_b_score: 2, team_a_name: 'Casa FC' }

	it('aplica o placar recebido quando não há cliques sendo salvos', () => {
		expect(mergeRealtimePlacar(current, incoming, 0)).toEqual(incoming)
	})

	it('mantém as pontuações da tela enquanto há cliques sendo salvos, mas aceita o resto', () => {
		expect(mergeRealtimePlacar(current, incoming, 2)).toEqual({ team_a_score: 7, team_b_score: 2, team_a_name: 'Casa FC' })
	})
})
