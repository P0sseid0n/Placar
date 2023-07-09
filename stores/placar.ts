import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'

export const usePlacarStore = defineStore('placar', () => {
	const client = useSupabaseClient()

	function createPlacar() {
		const id = nanoid(6)

		return id
	}

	return { createPlacar }
})
