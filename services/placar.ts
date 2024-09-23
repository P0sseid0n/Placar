import { customAlphabet } from 'nanoid'

export default {
	async create(payload: { score: number; teamA: string; teamB: string }) {
		const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
		const nanoid = customAlphabet(alphabet, 6)
		const id = nanoid()

		const user = useSupabaseUser()
		const client = useSupabaseClient()

		if (!user.value) throw new Error('Usuário não logado')

		const { error } = await client.from('placar').insert([
			{
				id,
				creator: user.value.id,
				score_increment: payload.score,
				team_a_name: payload.teamA,
				team_a_score: 0,
				team_b_name: payload.teamB,
				team_b_score: 0,
			},
		])

		if (error) {
			throw error
		}

		return id
	},

	async getAll() {
		const client = useSupabaseClient()
		const placares = await client.from('placar').select('*')

		if (placares.error) throw placares.error

		return placares.data
	},

	async getById(id: string) {
		const client = useSupabaseClient()
		const placar = await client.from('placar').select('*').eq('id', id).single()

		if (placar.error) {
			if (placar.error.code === 'PGRST116') return null

			throw placar.error
		}

		return placar.data
	},

	async updateTeamScore(id: string, team: 'a' | 'b', type: 'increment' | 'decrement') {
		const client = useSupabaseClient()

		const { data, error: fetchError } = await client
			.from('placar')
			.select(`team_a_score, team_b_score, score_increment`)
			.eq('id', id)
			.single()

		if (fetchError) {
			console.error('Fetch error:', fetchError)
			return
		}

		const newScore =
			data[team === 'a' ? 'team_a_score' : 'team_b_score'] + (type === 'increment' ? data.score_increment : -data.score_increment)

		await client
			.from('placar')
			.update({
				[team === 'a' ? 'team_a_score' : 'team_b_score']: newScore,
			})
			.eq('id', id)
	},

	async resetScore(id: string) {
		const client = useSupabaseClient()

		await client
			.from('placar')
			.update({
				team_a_score: 0,
				team_b_score: 0,
			})
			.eq('id', id)
	},

	async deletePlacar(id: string) {
		const client = useSupabaseClient()
		await client.from('placar').delete().eq('id', id)
	},
}
