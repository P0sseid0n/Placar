import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
	test: {
		environment: 'nuxt',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['app/services/**/*.ts', 'app/components/**/*.vue', 'app/pages/**/*.vue'],
			exclude: ['**/*.test.ts', '**/*.spec.ts', 'types/**', 'coverage/**']
		},
		globals: true
	}
})
