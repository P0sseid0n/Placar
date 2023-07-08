import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
	const user = useSupabaseUser()
	const client = useSupabaseAuthClient()
	const loading = ref(false)

	client.auth.onAuthStateChange((event, session) => {
		if (event === 'INITIAL_SESSION' && session !== null) {
			loading.value = true
		}
	})

	const isLogged = computed(() => !!user.value)

	async function signIn() {
		loading.value = true
		const { data, error } = await client.auth.signInWithOAuth({
			provider: 'discord',
			options: { skipBrowserRedirect: false, redirectTo: '' },
		})

		if (error) {
			throw new Error(error.message)
		}
	}

	async function signOut() {
		loading.value = false
		const { error } = await client.auth.signOut()

		if (error) {
			throw new Error(error.message)
		}
	}

	return { user, isLogged, signIn, signOut, loading }
})
