import { defineStore } from 'pinia'

interface IUser {
	email: string
}

export const useUserStore = defineStore('user', () => {
	const user = ref<IUser>()

	const isLogged = computed(() => !!user.value)

	function signIn() {
		user.value = {
			email: 'p0sseid0n@outlook.com',
		}
	}

	function signOut() {
		user.value = undefined
	}

	return { isLogged, signIn, signOut }
})
