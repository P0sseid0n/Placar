import { describe, expect, it } from 'vitest'
import { scoreAnimation } from './scoreAnimation'
import { teamLook } from './teamColors'

describe('scoreAnimation', () => {
	it('ponto somado: pula, pisca na cor do time e mostra +N verde', () => {
		expect(scoreAnimation(3, teamLook('azul'))).toEqual({
			kind: 'up',
			text: '+3',
			textColor: '#05df72',
			flash: true,
			glow: '#51a2ff2e',
			glowEdge: '#51a2ff',
		})
	})

	it('ponto tirado: afunda, mostra −N vermelho e não pisca', () => {
		expect(scoreAnimation(-1, teamLook('laranja'))).toMatchObject({
			kind: 'down',
			text: '−1',
			textColor: '#ff6467',
			flash: false,
		})
	})

	it('time preto: brilho branco e contorno branco', () => {
		expect(scoreAnimation(1, teamLook('preto'))).toMatchObject({
			glow: 'rgba(255,255,255,0.08)',
			glowEdge: '#ffffff',
		})
	})

	it('dupla com c1 preto: contorno na segunda cor', () => {
		expect(scoreAnimation(1, teamLook('preto-amarelo')).glowEdge).toBe('#fdc700')
	})

	it('dupla sem preto: brilho e contorno na primeira cor', () => {
		expect(scoreAnimation(2, teamLook('verde-amarelo'))).toMatchObject({
			glow: '#00a63e2e',
			glowEdge: '#00a63e',
		})
	})
})
