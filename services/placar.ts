import { customAlphabet } from 'nanoid'
import type { Database } from '~/types/database.types'

export default {
	async create(payload: { score: number; teamA: string; teamB: string }): Promise<string> {
		const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
		const nanoid = customAlphabet(alphabet, 6)
		const id = nanoid()

		const user = useSupabaseUser()
		const client = useSupabaseClient<Database>()

		if (!user.value) throw new Error('Usuário não logado')

		const { error } = await client.from('Placar').insert({
			creator: user.value.id,
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

	async getAll(): Promise<Database['public']['Tables']['Placar']['Row'][]> {
		const client = useSupabaseClient<Database>()
		const placares = await client.from('Placar').select('*')

		if (placares.error) throw placares.error

		return placares.data
	},

	async getById(id: string): Promise<Database['public']['Tables']['Placar']['Row'] | null> {
		const client = useSupabaseClient<Database>()
		const placar = await client.from('Placar').select('*').eq('public_id', id).single()

		if (placar.error) {
			if (placar.error.code === 'PGRST116') return null

			throw placar.error
		}

		return placar.data
	},

	async updateTeamScore(id: string, team: 'a' | 'b', type: 'increment' | 'decrement'): Promise<boolean> {
		const client = useSupabaseClient<Database>()

		const { data, error: fetchError } = await client
			.from('Placar')
			.select(`team_a_score, team_b_score, score_increment`)
			.eq('public_id', id)
			.single()

		if (fetchError) {
			console.error('Fetch error:', fetchError)
			return false
		}

		const teamScore = data[`team_${team}_score`] ?? 0

		const newScore = teamScore + (type === 'increment' ? data.score_increment : -data.score_increment)

		await client
			.from('Placar')
			.update({
				[`team_${team}_score`]: newScore,
			})
			.eq('public_id', id)

		return true
	},

	async resetScore(id: string): Promise<boolean> {
		const client = useSupabaseClient<Database>()

		await client
			.from('Placar')
			.update({
				team_a_score: 0,
				team_b_score: 0,
			})
			.eq('public_id', id)

		return true
	},

	async deletePlacar(id: string): Promise<boolean> {
		const client = useSupabaseClient<Database>()
		await client.from('Placar').delete().eq('public_id', id)

		return true
	},
}
