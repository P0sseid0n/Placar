export default {
	/** Exclui a conta do usuário logado e todos os placares dele (rota server/api/account.delete.ts) */
	async deleteAccount(): Promise<void> {
		await $fetch('/api/account', { method: 'DELETE' })
	},
}
