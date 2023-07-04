import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
	const isLogged = ref(false)

	function signIn() {
		isLogged.value = true
	}

	return { isLogged, signIn }
})
