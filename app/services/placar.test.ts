import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import placarService from './placar'

const { mockUser, mockClient } = vi.hoisted(() => ({
	mockUser: vi.fn(),
	mockClient: vi.fn(),
}))

// Os composables do Supabase são auto-imports do Nuxt: trocar via globalThis não funciona
mockNuxtImport('useSupabaseUser', () => mockUser)
mockNuxtImport('useSupabaseClient', () => mockClient)

vi.mock('nanoid', () => ({
	customAlphabet: () => () => 'abc123',
}))

/**
 * Query builder falso do supabase-js: todos os métodos encadeiam e o `await`
 * resolve com `result`. `calls` guarda os métodos chamados, na ordem.
 */
function query(result: { data?: unknown; error?: unknown }) {
	const calls: [string, unknown[]][] = []
	const builder: any = new Proxy(
		{},
		{
			get(_, prop) {
				if (prop === 'then') {
					return (resolve: (value: unknown) => void) => resolve({ data: null, error: null, ...result })
				}
				return (...args: unknown[]) => {
					calls.push([String(prop), args])
					return builder
				}
			},
		},
	)
	return { builder, calls }
}

/** Faz cada `client.from()` devolver a próxima query da lista */
function useQueries(...queries: ReturnType<typeof query>[]) {
	const from = vi.fn()
	for (const q of queries) from.mockReturnValueOnce(q.builder)
	mockClient.mockReturnValue({ from, rpc: vi.fn() })
	return from
}

/** Faz `client.rpc()` responder com `result` */
function useRpc(result: { data?: unknown; error?: unknown }) {
	const rpc = vi.fn().mockResolvedValue({ data: null, error: null, ...result })
	const from = vi.fn()
	mockClient.mockReturnValue({ from, rpc })
	return { rpc, from }
}

beforeEach(() => {
	vi.clearAllMocks()
	mockUser.mockReturnValue({ value: { sub: 'user123' } })
})

const newPlacar = { score: 2, teamA: ' Time A ', teamB: 'Time B', colorA: 'verde', colorB: 'preto-branco' }

describe('placar.create', () => {
	it('falha sem usuário logado', async () => {
		mockUser.mockReturnValue({ value: null })
		useQueries()

		await expect(placarService.create(newPlacar)).rejects.toThrow('Usuário não logado')
	})

	it('cria o placar em nome do usuário, com as cores, e retorna o ID público', async () => {
		const insert = query({ error: null })
		useQueries(insert)

		await expect(placarService.create(newPlacar)).resolves.toBe('abc123')
		expect(insert.calls).toEqual([
			[
				'insert',
				[
					{
						creator: 'user123',
						public_id: 'abc123',
						score_increment: 2,
						team_a_name: 'Time A',
						team_a_color: 'verde',
						team_a_score: 0,
						team_b_name: 'Time B',
						team_b_color: 'preto-branco',
						team_b_score: 0,
					},
				],
			],
		])
	})

	it('repassa o erro do banco', async () => {
		const dbError = new Error('DB Error')
		useQueries(query({ error: dbError }))

		await expect(placarService.create(newPlacar)).rejects.toBe(dbError)
	})
})

describe('placar.getAll', () => {
	it('busca só os placares do usuário, do mais recente para o mais antigo', async () => {
		const rows = [{ id: 1, public_id: 'test' }]
		const select = query({ data: rows })
		useQueries(select)

		await expect(placarService.getAll()).resolves.toEqual(rows)
		expect(select.calls).toEqual([
			['select', ['*']],
			['eq', ['creator', 'user123']],
			['order', ['created_at', { ascending: false }]],
		])
	})

	it('retorna lista vazia sem usuário logado', async () => {
		mockUser.mockReturnValue({ value: null })
		const from = useQueries()

		await expect(placarService.getAll()).resolves.toEqual([])
		expect(from).not.toHaveBeenCalled()
	})

	it('repassa o erro do banco', async () => {
		const getAllError = new Error('GetAll Error')
		useQueries(query({ error: getAllError }))

		await expect(placarService.getAll()).rejects.toBe(getAllError)
	})
})

describe('placar.getById', () => {
	it('busca pelo ID público', async () => {
		const row = { id: 1, public_id: 'abc123' }
		const select = query({ data: row })
		useQueries(select)

		await expect(placarService.getById('abc123')).resolves.toEqual(row)
		expect(select.calls).toContainEqual(['eq', ['public_id', 'abc123']])
	})

	it('retorna null quando não encontra (PGRST116)', async () => {
		useQueries(query({ error: { code: 'PGRST116' } }))

		await expect(placarService.getById('naoexi')).resolves.toBeNull()
	})

	it('repassa outros erros', async () => {
		const otherError = { code: 'OTHER', message: 'Other error' }
		useQueries(query({ error: otherError }))

		await expect(placarService.getById('abc123')).rejects.toBe(otherError)
	})
})

describe('placar.updateTeamScore', () => {
	it('pontua pela função do banco e retorna a pontuação salva', async () => {
		const { rpc } = useRpc({ data: 7 })

		await expect(placarService.updateTeamScore('abc123', 'a', 'increment')).resolves.toBe(7)
		expect(rpc).toHaveBeenCalledWith('placar_add_points', {
			p_public_id: 'abc123',
			p_team: 'a',
			p_direction: 'increment',
		})
	})

	it('repassa a direção de tirar ponto', async () => {
		const { rpc } = useRpc({ data: 0 })

		await expect(placarService.updateTeamScore('abc123', 'b', 'decrement')).resolves.toBe(0)
		expect(rpc).toHaveBeenCalledWith(
			'placar_add_points',
			expect.objectContaining({ p_team: 'b', p_direction: 'decrement' }),
		)
	})

	it('retorna null se o banco recusar (ex.: sem permissão)', async () => {
		useRpc({ error: { code: 'P0002', message: 'Placar não encontrado' } })

		await expect(placarService.updateTeamScore('abc123', 'a', 'increment')).resolves.toBeNull()
	})
})

describe('placar.updateSettings', () => {
	const settings = { teamA: ' Casa ', teamB: 'Fora', score: 3, scoreSize: 'M' as const }

	it('salva nomes (sem espaços nas pontas), incremento e tamanho', async () => {
		const update = query({ data: [{ id: 1 }] })
		useQueries(update)

		await expect(placarService.updateSettings('abc123', settings)).resolves.toBeUndefined()
		expect(update.calls.slice(0, 2)).toEqual([
			['update', [{ team_a_name: 'Casa', team_b_name: 'Fora', score_increment: 3, score_size: 'M' }]],
			['eq', ['public_id', 'abc123']],
		])
	})

	it('falha se nenhuma linha foi alterada (placar inexistente ou sem permissão)', async () => {
		useQueries(query({ data: [] }))

		await expect(placarService.updateSettings('abc123', settings)).rejects.toThrow('Placar não encontrado')
	})

	it('repassa o erro do banco (ex.: nome com mais de 24 caracteres)', async () => {
		const dbError = { code: '23514', message: 'check constraint' }
		useQueries(query({ error: dbError }))

		await expect(placarService.updateSettings('abc123', settings)).rejects.toBe(dbError)
	})
})

describe('placar.resetScore', () => {
	it('zera e apaga as jogadas pela função do banco', async () => {
		const { rpc } = useRpc({})

		await expect(placarService.resetScore('abc123')).resolves.toBeUndefined()
		expect(rpc).toHaveBeenCalledWith('placar_reset', { p_public_id: 'abc123' })
	})

	it('repassa o erro do banco', async () => {
		const dbError = { code: 'P0002', message: 'Placar não encontrado' }
		useRpc({ error: dbError })

		await expect(placarService.resetScore('abc123')).rejects.toBe(dbError)
	})
})

describe('placar.deletePlacar', () => {
	it('apaga pelo ID público', async () => {
		const del = query({ data: [{ id: 1 }] })
		useQueries(del)

		await expect(placarService.deletePlacar('abc123')).resolves.toBeUndefined()
		expect(del.calls.slice(0, 2)).toEqual([
			['delete', []],
			['eq', ['public_id', 'abc123']],
		])
	})

	it('falha se nenhuma linha foi apagada (placar inexistente ou sem permissão)', async () => {
		useQueries(query({ data: [] }))

		await expect(placarService.deletePlacar('abc123')).rejects.toThrow('Placar não encontrado')
	})
})

describe('placar.getEvents', () => {
	it('busca as últimas jogadas do placar, da mais recente para a mais antiga', async () => {
		const rows = [{ id: 2, team: 'a', delta: 1, score_after: 3 }]
		const select = query({ data: rows })
		useQueries(select)

		await expect(placarService.getEvents(1, 5)).resolves.toEqual(rows)
		expect(select.calls).toEqual([
			['select', ['*']],
			['eq', ['placar_id', 1]],
			['order', ['created_at', { ascending: false }]],
			['order', ['id', { ascending: false }]],
			['limit', [5]],
		])
	})

	it('repassa o erro do banco', async () => {
		const dbError = new Error('DB Error')
		useQueries(query({ error: dbError }))

		await expect(placarService.getEvents(1)).rejects.toBe(dbError)
	})
})

describe('placar.undoLast', () => {
	it('desfaz pela função do banco e retorna o time e a pontuação', async () => {
		const { rpc } = useRpc({ data: [{ team: 'b', score: 4 }] })

		await expect(placarService.undoLast('abc123')).resolves.toEqual({ team: 'b', score: 4 })
		expect(rpc).toHaveBeenCalledWith('placar_undo_last', { p_public_id: 'abc123' })
	})

	it('retorna null quando não há jogadas', async () => {
		useRpc({ data: [] })

		await expect(placarService.undoLast('abc123')).resolves.toBeNull()
	})

	it('repassa o erro do banco', async () => {
		const dbError = { code: 'P0002', message: 'Placar não encontrado' }
		useRpc({ error: dbError })

		await expect(placarService.undoLast('abc123')).rejects.toBe(dbError)
	})
})
