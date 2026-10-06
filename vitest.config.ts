import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
	test: {
		environment: 'nuxt',
		// Subir o ambiente Nuxt a frio pode passar dos 10s padrão quando vários arquivos rodam juntos
		hookTimeout: 30_000,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['app/services/**/*.ts', 'app/utils/**/*.ts', 'app/components/**/*.vue', 'app/pages/**/*.vue'],
			exclude: ['**/*.test.ts', '**/*.spec.ts', 'types/**', 'coverage/**']
		},
		globals: true
	}
})
