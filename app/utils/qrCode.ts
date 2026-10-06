import { encode } from 'uqr'

/** Matriz do QR code (true = módulo escuro), com correção de erro M e sem borda (o cartão branco dá o respiro) */
export function qrMatrix(text: string): boolean[][] {
	return encode(text, { ecc: 'M', border: 0 }).data
}

/** Um único `path` SVG com um quadrado 1×1 por módulo escuro (viewBox 0 0 n n) */
export function qrPath(matrix: boolean[][]): string {
	const parts: string[] = []
	matrix.forEach((row, y) => {
		row.forEach((dark, x) => {
			if (dark) parts.push(`M${x} ${y}h1v1h-1z`)
		})
	})
	return parts.join('')
}

/**
 * PNG do QR code (~1024px), com fundo branco e margem, para "Baixar QR code".
 * Só roda no navegador (usa canvas).
 */
export function qrPngDataUrl(matrix: boolean[][], size = 1024, margin = 64): string {
	const canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext('2d')!

	ctx.fillStyle = '#ffffff'
	ctx.fillRect(0, 0, size, size)

	const cell = Math.floor((size - margin * 2) / matrix.length)
	const offset = Math.floor((size - cell * matrix.length) / 2)
	ctx.fillStyle = '#18181b'
	matrix.forEach((row, y) => {
		row.forEach((dark, x) => {
			if (dark) ctx.fillRect(offset + x * cell, offset + y * cell, cell, cell)
		})
	})

	return canvas.toDataURL('image/png')
}

/** URL completa do placar, usada no link e no QR code */
export function placarUrl(origin: string, publicId: string): string {
	return `${origin.replace(/\/$/, '')}/id/${publicId}`
}
