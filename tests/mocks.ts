import { vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// Configurar mocks antes de qualquer import
export const setupMocks = () => {
	const mockUser = vi.fn()
	const mockClient = vi.fn()

	mockNuxtImport('useSupabaseUser', () => mockUser)
	mockNuxtImport('useSupabaseClient', () => mockClient)

	return { mockUser, mockClient }
}
