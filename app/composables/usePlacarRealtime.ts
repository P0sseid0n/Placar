import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

type PlacarRow = Database['public']['Tables']['Placar']['Row']
type PlacarEventRow = Database['public']['Tables']['PlacarEvent']['Row']

/**
 * Escuta as mudanças de um placar pelo Supabase Realtime (só no navegador).
 *
 * - `onUpdate`: o placar mudou (ponto, desfazer, reiniciar ou configurações), com a linha nova.
 * - `onDelete`: o placar foi apagado.
 * - `onEvent`: chegou uma jogada nova (INSERT em PlacarEvent), que dispara a animação ao marcar ponto.
 *   Reiniciar e desfazer apagam jogadas em vez de inserir, então não chegam aqui.
 *
 * Presença: quem é o dono e está com a página aberta se anuncia no canal (`track`).
 * `ownerOnline` fica verdadeiro enquanto há pelo menos uma aba do dono conectada (selo "Ao vivo").
 *
 * Retorna `connected` (inscrição ativa) e `ownerOnline`.
 */
export function usePlacarRealtime(
	placar: Ref<PlacarRow | null | undefined>,
	isOwner: Ref<boolean>,
	handlers: { onUpdate: (row: PlacarRow) => void; onDelete: () => void; onEvent: (event: PlacarEventRow) => void },
) {
	const client = useSupabaseClient<Database>()
	const connected = ref(false)
	const ownerOnline = ref(false)
	let channel: RealtimeChannel | undefined

	// Entra ou sai da presença quando a inscrição fica ativa ou quando muda quem está logado
	watch([connected, isOwner], async ([isConnected, owner]) => {
		if (!channel || !isConnected) return
		if (owner && placar.value) await channel.track({ user: placar.value.creator })
		else await channel.untrack()
	})

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
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'PlacarEvent', filter: `placar_id=eq.${current.id}` },
				payload => handlers.onEvent(payload.new as PlacarEventRow),
			)
			.on('presence', { event: 'sync' }, () => {
				const entries = Object.values(channel?.presenceState<{ user: string }>() ?? {}).flat()
				ownerOnline.value = entries.some(entry => entry.user === current.creator)
			})
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
		ownerOnline.value = false
		if (channel) client.removeChannel(channel)
	})

	return { connected, ownerOnline }
}
