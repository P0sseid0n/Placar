import { defineStore } from 'pinia'
import { customAlphabet } from 'nanoid'

import { Database } from '../DatabaseDefinitions'

export const usePlacarStore = defineStore('placar', () => {
	const user = useSupabaseUser()
	const client = useSupabaseClient<Database>()

	async function createPlacar(payload: { score: number; teamA: string; teamB: string }) {
		const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
		const nanoid = customAlphabet(alphabet, 6)
		const id = nanoid()

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
	}

	async function getAllPlacar() {
		const placares = await client.from('placar').select('*')

		if (placares.error) throw placares.error

		return placares.data
	}

	async function getPlacarById(id: string) {
		const placar = await client.from('placar').select('*').eq('id', id).single()

		if (placar.error) {
			if (placar.error.code === 'PGRST116') return null

			throw placar.error
		}

		return placar.data
	}

	return { createPlacar, getAllPlacar, getPlacarById }
})
