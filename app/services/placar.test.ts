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
	mockClient.mockReturnValue({ from })
	return from
}

beforeEach(() => {
	vi.clearAllMocks()
	mockUser.mockReturnValue({ value: { sub: 'user123' } })
})

describe('placar.create', () => {
	it('falha sem usuário logado', async () => {
		mockUser.mockReturnValue({ value: null })
		useQueries()

		await expect(placarService.create({ score: 1, teamA: 'A', teamB: 'B' })).rejects.toThrow('Usuário não logado')
	})

	it('cria o placar em nome do usuário e retorna o ID público', async () => {
		const insert = query({ error: null })
		useQueries(insert)

		await expect(placarService.create({ score: 2, teamA: 'Time A', teamB: 'Time B' })).resolves.toBe('abc123')
		expect(insert.calls).toEqual([
			[
				'insert',
				[
					{
						creator: 'user123',
						public_id: 'abc123',
						score_increment: 2,
						team_a_name: 'Time A',
						team_a_score: 0,
						team_b_name: 'Time B',
						team_b_score: 0,
					},
				],
			],
		])
	})

	it('repassa o erro do banco', async () => {
		const dbError = new Error('DB Error')
		useQueries(query({ error: dbError }))

		await expect(placarService.create({ score: 1, teamA: 'A', teamB: 'B' })).rejects.toBe(dbError)
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
	const current = { team_a_score: 5, team_b_score: 3, score_increment: 2 }

	it('soma o incremento e retorna a pontuação salva', async () => {
		const update = query({ data: { team_a_score: 7 } })
		useQueries(query({ data: current }), update)

		await expect(placarService.updateTeamScore('abc123', 'a', 'increment')).resolves.toBe(7)
		expect(update.calls[0]).toEqual(['update', [{ team_a_score: 7 }]])
	})

	it('subtrai o incremento', async () => {
		const update = query({ data: { team_b_score: 1 } })
		useQueries(query({ data: current }), update)

		await expect(placarService.updateTeamScore('abc123', 'b', 'decrement')).resolves.toBe(1)
		expect(update.calls[0]).toEqual(['update', [{ team_b_score: 1 }]])
	})

	it('não deixa a pontuação ficar negativa', async () => {
		const update = query({ data: { team_b_score: 0 } })
		useQueries(query({ data: { team_a_score: 0, team_b_score: 1, score_increment: 3 } }), update)

		await expect(placarService.updateTeamScore('abc123', 'b', 'decrement')).resolves.toBe(0)
		expect(update.calls[0]).toEqual(['update', [{ team_b_score: 0 }]])
	})

	it('não grava nada quando o time já está em 0 e o clique é para tirar', async () => {
		const from = useQueries(query({ data: { team_a_score: 0, team_b_score: 0, score_increment: 1 } }))

		await expect(placarService.updateTeamScore('abc123', 'a', 'decrement')).resolves.toBe(0)
		expect(from).toHaveBeenCalledTimes(1)
	})

	it('trata pontuação nula como 0', async () => {
		const update = query({ data: { team_a_score: 1 } })
		useQueries(query({ data: { team_a_score: null, team_b_score: null, score_increment: 1 } }), update)

		await expect(placarService.updateTeamScore('abc123', 'a', 'increment')).resolves.toBe(1)
	})

	it('retorna null se não conseguir ler o placar', async () => {
		useQueries(query({ error: new Error('Fetch error') }))

		await expect(placarService.updateTeamScore('abc123', 'a', 'increment')).resolves.toBeNull()
	})

	it('retorna null se não conseguir gravar (ex.: sem permissão)', async () => {
		useQueries(query({ data: current }), query({ error: { code: 'PGRST116' } }))

		await expect(placarService.updateTeamScore('abc123', 'a', 'increment')).resolves.toBeNull()
	})
})

describe('placar.resetScore', () => {
	it('zera os dois times', async () => {
		const update = query({ data: [{ id: 1 }] })
		useQueries(update)

		await expect(placarService.resetScore('abc123')).resolves.toBeUndefined()
		expect(update.calls[0]).toEqual(['update', [{ team_a_score: 0, team_b_score: 0 }]])
	})

	it('falha se nenhuma linha foi alterada (placar inexistente ou sem permissão)', async () => {
		useQueries(query({ data: [] }))

		await expect(placarService.resetScore('abc123')).rejects.toThrow('Placar não encontrado')
	})

	it('repassa o erro do banco', async () => {
		const dbError = new Error('DB Error')
		useQueries(query({ error: dbError }))

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
