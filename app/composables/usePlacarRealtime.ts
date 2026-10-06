import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type PlacarRow = Database['public']['Tables']['Placar']['Row']

/**
 * Escuta as mudanças de um placar pelo Supabase Realtime (só no navegador).
 *
 * - `onUpdate`: o placar mudou (ponto, desfazer, reiniciar ou configurações), com a linha nova.
 * - `onDelete`: o placar foi apagado.
 *
 * Retorna `connected`, verdadeiro enquanto a inscrição está ativa (usado pelo selo "Ao vivo").
 */
export function usePlacarRealtime(
	placar: Ref<PlacarRow | null | undefined>,
	handlers: { onUpdate: (row: PlacarRow) => void; onDelete: () => void },
) {
	const client = useSupabaseClient<Database>()
	const connected = ref(false)
	let channel: RealtimeChannel | undefined

	onMounted(() => {
		const current = placar.value
		if (!current) return

		channel = client
			.channel(`placar-${current.public_id}`)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'Placar', filter: `public_id=eq.${current.public_id}` },
				payload => handlers.onUpdate(payload.new as PlacarRow),
			)
			// O realtime não filtra DELETE: chega o id de qualquer placar apagado e comparamos aqui
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'Placar' }, payload => {
				if ((payload.old as Partial<PlacarRow>).id === current.id) handlers.onDelete()
			})
			.subscribe(status => {
				connected.value = status === 'SUBSCRIBED'
			})
	})

	onBeforeUnmount(() => {
		connected.value = false
		if (channel) client.removeChannel(channel)
	})

	return { connected }
}
