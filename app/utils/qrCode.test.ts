import { describe, expect, it } from 'vitest'
import { placarUrl, qrMatrix, qrPath } from './qrCode'

describe('qrMatrix', () => {
	it('gera uma matriz quadrada com os três quadrados de posição nos cantos', () => {
		const matrix = qrMatrix('https://placar.app/id/k3x9a2')
		const n = matrix.length

		expect(n).toBeGreaterThanOrEqual(21)
		expect(matrix.every(row => row.length === n)).toBe(true)
		// Cantos superior esquerdo, superior direito e inferior esquerdo são escuros (padrão de posição)
		expect(matrix[0]![0]).toBe(true)
		expect(matrix[0]![n - 1]).toBe(true)
		expect(matrix[n - 1]![0]).toBe(true)
	})

	it('é determinística para o mesmo texto', () => {
		expect(qrMatrix('abc')).toEqual(qrMatrix('abc'))
	})
})

describe('qrPath', () => {
	it('desenha um quadrado por módulo escuro', () => {
		const matrix = [
			[true, false],
			[false, true],
		]
		expect(qrPath(matrix)).toBe('M0 0h1v1h-1zM1 1h1v1h-1z')
	})
})

describe('placarUrl', () => {
	it('monta a URL completa do placar', () => {
		expect(placarUrl('http://localhost:3000', 'k3x9a2')).toBe('http://localhost:3000/id/k3x9a2')
		expect(placarUrl('https://placar.app/', 'k3x9a2')).toBe('https://placar.app/id/k3x9a2')
	})
})
