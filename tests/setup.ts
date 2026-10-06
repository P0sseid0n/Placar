import { vi } from 'vitest'

// Mock global console methods for cleaner test output
global.console = {
	...console,
	log: vi.fn(),
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
}

// Global test utilities
;(globalThis as any).mockSupabaseUser = (userData?: any) => {
	return {
		value: userData || {
			id: 'test-user-id',
			email: 'test@example.com',
			user_metadata: {},
			app_metadata: {},
			aud: 'authenticated',
			created_at: '2024-01-01T00:00:00.000Z',
		},
	}
}

;(globalThis as any).mockSupabaseClient = () => {
	return {
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
}
