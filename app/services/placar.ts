import { customAlphabet } from 'nanoid'
import type { Database } from '~/types/database.types'

type PlacarRow = Database['public']['Tables']['Placar']['Row']

export default {
	async create(payload: { score: number; teamA: string; teamB: string }): Promise<string> {
		const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
		const nanoid = customAlphabet(alphabet, 6)
		const id = nanoid()

		const user = useSupabaseUser()
		const client = useSupabaseClient<Database>()

		if (!user.value) throw new Error('Usuário não logado')

		const { error } = await client.from('Placar').insert({
			creator: user.value.sub,
			public_id: id,
			score_increment: payload.score,
			team_a_name: payload.teamA,
			team_a_score: 0,
			team_b_name: payload.teamB,
			team_b_score: 0,
		})

		if (error) {
			throw error
		}

		return id
	},

	/** Placares do usuário logado, do mais recente para o mais antigo */
	async getAll(): Promise<PlacarRow[]> {
		const user = useSupabaseUser()
		const client = useSupabaseClient<Database>()

		if (!user.value) return []

		const placares = await client
			.from('Placar')
			.select('*')
			.eq('creator', user.value.sub)
			.order('created_at', { ascending: false })

		if (placares.error) throw placares.error

		return placares.data
	},

	async getById(id: string): Promise<PlacarRow | null> {
		const client = useSupabaseClient<Database>()
		const placar = await client.from('Placar').select('*').eq('public_id', id).single()

		if (placar.error) {
			if (placar.error.code === 'PGRST116') return null

			throw placar.error
		}

		return placar.data
	},

	/**
	 * Soma ou subtrai `score_increment` da pontuação do time, sem deixar ficar abaixo de 0.
	 * Retorna a pontuação salva no banco, ou `null` se não foi possível salvar.
	 */
	async updateTeamScore(id: string, team: 'a' | 'b', type: 'increment' | 'decrement'): Promise<number | null> {
		const client = useSupabaseClient<Database>()
		const column = `team_${team}_score` as const

		const { data, error: fetchError } = await client
			.from('Placar')
			.select(`team_a_score, team_b_score, score_increment`)
			.eq('public_id', id)
			.single()

		if (fetchError) {
			console.error('Fetch error:', fetchError)
			return null
		}

		const teamScore = data[column] ?? 0
		const newScore = Math.max(0, teamScore + (type === 'increment' ? data.score_increment : -data.score_increment))

		if (newScore === teamScore) return teamScore

		// O select depois do update devolve a linha salva; sem permissão (RLS) não volta nenhuma linha
		const { data: saved, error: updateError } = await client
			.from('Placar')
			.update({ [column]: newScore })
			.eq('public_id', id)
			.select(column)
			.single()

		if (updateError) {
			console.error('Update error:', updateError)
			return null
		}

		return saved[column] ?? 0
	},

	async resetScore(id: string): Promise<void> {
		const client = useSupabaseClient<Database>()

		const { data, error } = await client
			.from('Placar')
			.update({
				team_a_score: 0,
				team_b_score: 0,
			})
			.eq('public_id', id)
			.select('id')

		if (error) throw error
		if (!data.length) throw new Error('Placar não encontrado')
	},

	async deletePlacar(id: string): Promise<void> {
		const client = useSupabaseClient<Database>()

		const { data, error } = await client.from('Placar').delete().eq('public_id', id).select('id')

		if (error) throw error
		if (!data.length) throw new Error('Placar não encontrado')
	},
}
