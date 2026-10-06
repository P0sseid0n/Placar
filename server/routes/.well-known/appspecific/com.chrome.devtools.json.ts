// O Chrome DevTools faz esse request automaticamente; responde vazio para evitar warns do Vue Router
export default defineEventHandler(event => {
	setResponseStatus(event, 204)
	return null
})
