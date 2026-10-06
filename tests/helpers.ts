import { vi, expect } from 'vitest'
import type { Database } from '~/types/database.types'

export const createMockPlacar = (
	overrides?: Partial<Database['public']['Tables']['Placar']['Row']>,
): Database['public']['Tables']['Placar']['Row'] => {
	return {
		id: 1,
		public_id: 'abc123',
		creator: 'test-user-id',
		team_a_name: 'Time A',
		team_a_score: 0,
		team_b_name: 'Time B',
		team_b_score: 0,
		score_increment: 1,
		created_at: '2024-01-01T00:00:00.000Z',
		...overrides,
	}
}

export const createMockUser = (overrides?: any) => {
	return {
		id: 'test-user-id',
		email: 'test@example.com',
		user_metadata: {},
		app_metadata: {},
		aud: 'authenticated',
		created_at: '2024-01-01T00:00:00.000Z',
		...overrides,
	}
}

export const createMockSupabaseClient = () => {
	const mockClient = {
		from: vi.fn(() => ({
			insert: vi.fn(() => ({ error: null })),
			select: vi.fn(() => ({
				eq: vi.fn(() => ({
					single: vi.fn(() => ({ data: null, error: null })),
				})),
				error: null,
				data: [],
			})),
			update: vi.fn(() => ({
				eq: vi.fn(() => ({ error: null })),
			})),
			delete: vi.fn(() => ({
				eq: vi.fn(() => ({ error: null })),
			})),
		})),
	}

	return mockClient
}

export const expectDatabaseCall = (mockFrom: any, table: string) => {
	expect(mockFrom).toHaveBeenCalledWith(table)
}

export const expectInsertCall = (mockInsert: any, data: any) => {
	expect(mockInsert).toHaveBeenCalledWith(data)
}

export const expectSelectCall = (mockSelect: any, fields = '*') => {
	expect(mockSelect).toHaveBeenCalledWith(fields)
}

export const expectUpdateCall = (mockUpdate: any, data: any) => {
	expect(mockUpdate).toHaveBeenCalledWith(data)
}

export const expectEqCall = (mockEq: any, field: string, value: any) => {
	expect(mockEq).toHaveBeenCalledWith(field, value)
}
