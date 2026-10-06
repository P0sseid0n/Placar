import { describe, expect, it, vi } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import accountService from './account'

// Rota falsa no lugar de server/api/account.delete.ts; cada teste define a resposta
const handler = vi.fn()
registerEndpoint('/api/account', { method: 'DELETE', handler: () => handler() })

describe('account.deleteAccount', () => {
	it('chama DELETE /api/account', async () => {
		handler.mockReturnValueOnce(null)

		await expect(accountService.deleteAccount()).resolves.toBeUndefined()
		expect(handler).toHaveBeenCalledTimes(1)
	})

	it('falha quando a rota responde com erro', async () => {
		handler.mockImplementationOnce(() => {
			throw createError({ statusCode: 401, message: 'Faça login para excluir a conta.' })
		})

		await expect(accountService.deleteAccount()).rejects.toMatchObject({ statusCode: 401 })
	})
})
