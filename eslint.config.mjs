// Regras do @nuxt/eslint (Vue, TypeScript e auto-imports do Nuxt).
// Formatação fica com o Prettier (.prettierrc); o eslint não verifica estilo.
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
	{
		ignores: ['docs/**', 'supabase/**', 'app/types/database.types.ts'],
	},
	{
		rules: {
			// O Prettier escreve elementos vazios como <input />; quem decide a formatação é ele
			'vue/html-self-closing': 'off',
			// Com props tipadas em TypeScript, `undefined` já é o padrão das props opcionais
			'vue/require-default-prop': 'off',
		},
	},
	{
		// Mocks do Supabase nos testes precisam de `any`
		files: ['**/*.test.ts', 'tests/**'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
)
