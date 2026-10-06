import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

// DELETE /api/account: exclui a conta do usuário logado (docs/placar-design/PERFIL.md).
// Roda no servidor porque precisa da chave secreta (NUXT_SUPABASE_SECRET_KEY), que não pode ir para o navegador.
// Os placares e as jogadas são apagados em cascata pelo banco (Placar.creator → auth.users on delete cascade).
export default defineEventHandler(async event => {
	// Só exclui a conta da própria sessão: o id vem do token validado, nunca do corpo da requisição
	const claims = await serverSupabaseUser(event).catch(() => null)
	if (!claims?.sub) {
		throw createError({ statusCode: 401, message: 'Faça login para excluir a conta.' })
	}

	const admin = serverSupabaseServiceRole(event)
	const { error } = await admin.auth.admin.deleteUser(claims.sub)

	if (error) {
		console.error('Erro ao excluir conta:', error.message)
		throw createError({ statusCode: 500, message: 'Não foi possível excluir a conta.' })
	}

	setResponseStatus(event, 204)
	return null
})
