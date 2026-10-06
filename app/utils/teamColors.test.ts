import { describe, expect, it } from 'vitest'
import { DUAL_TEAM_COLORS, SOLID_TEAM_COLORS, TEAM_PALETTE, isTeamColorId, teamLook, teamLookFor } from './teamColors'

describe('TEAM_PALETTE', () => {
	it('tem 8 sólidas e 8 duplas, com ids únicos', () => {
		expect(SOLID_TEAM_COLORS).toHaveLength(8)
		expect(DUAL_TEAM_COLORS).toHaveLength(8)
		expect(new Set(TEAM_PALETTE.map(c => c.id)).size).toBe(16)
	})

	it('usa o vermelho de time, diferente do vermelho de erro', () => {
		expect(teamLook('vermelho').c1).toBe('#fb2c36')
	})
})

describe('isTeamColorId', () => {
	it('reconhece ids da paleta', () => {
		expect(isTeamColorId('preto-branco')).toBe(true)
		expect(isTeamColorId('#51a2ff')).toBe(false)
	})
})

describe('teamLook', () => {
	it('cor sólida', () => {
		expect(teamLook('azul')).toMatchObject({
			dual: false,
			dot: '#51a2ff',
			stripe: '#51a2ff',
			bar: '#51a2ff',
			tint: '#51a2ff24',
			ink: '#51a2ff',
			edge: 'none',
			swEdge: 'none',
			lead: '#51a2ff99',
		})
	})

	it('cor dupla: bolinha em diagonal, faixa listrada, barra dividida e monograma c1/c2', () => {
		expect(teamLook('amarelo-azul')).toMatchObject({
			dual: true,
			dot: 'linear-gradient(135deg, #fdc700 50%, #155dfc 50%)',
			stripe: 'repeating-linear-gradient(135deg, #fdc700 0 10px, #155dfc 10px 20px)',
			bar: 'linear-gradient(180deg, #fdc700 50%, #155dfc 50%)',
			tint: '#fdc700',
			ink: '#155dfc',
			lead: '#fdc70099',
		})
	})

	it('preto sólido: monograma preto com letra branca, anéis cinza e líder cinza', () => {
		expect(teamLook('preto')).toMatchObject({
			tint: '#0a0a0a',
			ink: '#ffffff',
			edge: 'inset 0 0 0 1px #52525c',
			swEdge: 'inset 0 0 0 1px #71717b',
			lead: '#71717b',
		})
	})

	it('dupla com c1 preto: anéis cinza e líder na segunda cor', () => {
		expect(teamLook('preto-vermelho')).toMatchObject({
			tint: '#0a0a0a',
			ink: '#fb2c36',
			edge: 'inset 0 0 0 1px #52525c',
			lead: '#fb2c3699',
		})
	})

	it('id desconhecido cai no azul', () => {
		expect(teamLook('nao-existe').id).toBe('azul')
		expect(teamLook(null).id).toBe('azul')
	})
})

describe('teamLookFor', () => {
	it('usa a cor do placar', () => {
		expect(teamLookFor({ team_a_color: 'verde', team_b_color: 'roxo' }, 'b').id).toBe('roxo')
	})

	it('usa azul e laranja quando o placar não tem cor', () => {
		expect(teamLookFor({}, 'a').id).toBe('azul')
		expect(teamLookFor({ team_b_color: null }, 'b').id).toBe('laranja')
	})
})
