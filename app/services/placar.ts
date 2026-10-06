import { customAlphabet } from 'nanoid'
import type { Database } from '~/types/database.types'
import type { ScoreSize } from '~/utils/placar'

type PlacarRow = Database['public']['Tables']['Placar']['Row']
type PlacarEventRow = Database['public']['Tables']['PlacarEvent']['Row']

export interface PlacarSettings {
	teamA: string
	teamB: string
	score: number
	scoreSize: ScoreSize
}

export default {
	async create(payload: { score: number; teamA: string; teamB: string; colorA: string; colorB: string }): Promise<string> {
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
			team_a_name: payload.teamA.trim(),
			team_a_color: payload.colorA,
			team_a_score: 0,
			team_b_name: payload.teamB.trim(),
			team_b_color: payload.colorB,
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
	 * Soma ou subtrai `score_increment` da pontuação do time e registra a jogada.
	 * A conta é feita no banco (placar_add_points), numa única operação e sem ficar abaixo de 0.
	 * Retorna a pontuação salva, ou `null` se não foi possível salvar.
	 */
	async updateTeamScore(id: string, team: 'a' | 'b', type: 'increment' | 'decrement'): Promise<number | null> {
		const client = useSupabaseClient<Database>()

		const { data, error } = await client.rpc('placar_add_points', {
			p_public_id: id,
			p_team: team,
			p_direction: type,
		})

		if (error) {
			console.error('Erro ao salvar ponto:', error)
			return null
		}

		return data
	},

	/** Nomes, pontuação por clique e tamanho dos números */
	async updateSettings(id: string, settings: PlacarSettings): Promise<void> {
		const client = useSupabaseClient<Database>()

		const { data, error } = await client
			.from('Placar')
			.update({
				team_a_name: settings.teamA.trim(),
				team_b_name: settings.teamB.trim(),
				score_increment: settings.score,
				score_size: settings.scoreSize,
			})
			.eq('public_id', id)
			.select('id')

		if (error) throw error
		if (!data.length) throw new Error('Placar não encontrado')
	},

	/** Zera as duas pontuações e apaga as jogadas, na mesma transação (placar_reset) */
	async resetScore(id: string): Promise<void> {
		const client = useSupabaseClient<Database>()

		const { error } = await client.rpc('placar_reset', { p_public_id: id })

		if (error) throw error
	},

	async deletePlacar(id: string): Promise<void> {
		const client = useSupabaseClient<Database>()

		const { data, error } = await client.from('Placar').delete().eq('public_id', id).select('id')

		if (error) throw error
		if (!data.length) throw new Error('Placar não encontrado')
	},

	/** Últimas jogadas do placar, da mais recente para a mais antiga */
	async getEvents(placarId: number, limit = 10): Promise<PlacarEventRow[]> {
		const client = useSupabaseClient<Database>()

		const { data, error } = await client
			.from('PlacarEvent')
			.select('*')
			.eq('placar_id', placarId)
			.order('created_at', { ascending: false })
			.order('id', { ascending: false })
			.limit(limit)

		if (error) throw error

		return data
	},

	/**
	 * Desfaz a última jogada (placar_undo_last).
	 * Retorna o time e a pontuação depois de desfazer, ou `null` se não havia jogadas.
	 */
	async undoLast(id: string): Promise<{ team: 'a' | 'b'; score: number } | null> {
		const client = useSupabaseClient<Database>()

		const { data, error } = await client.rpc('placar_undo_last', { p_public_id: id })

		if (error) throw error

		const undone = data?.[0]
		return undone ? { team: undone.team as 'a' | 'b', score: undone.score } : null
	},
}
