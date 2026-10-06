import type { ScoreAnimation } from '~/utils/scoreAnimation'
import type { TeamLook } from '~/utils/teamColors'

type Team = 'a' | 'b'

/** Animação em curso de um time; `key` muda a cada jogada para reiniciar as animações CSS */
export interface TeamAnimation extends ScoreAnimation {
	key: number
}

/**
 * Animação ao marcar ponto (HANDOFF, seção 5), usada pelo dono e pelo visitante.
 * `play(time, delta)` é chamado quando chega um INSERT em PlacarEvent pelo realtime.
 * Com "reduzir movimento" ativo no sistema, nada é animado.
 */
export function useScoreAnimation(looks: Ref<Record<Team, TeamLook>>) {
	const animations = reactive<Record<Team, TeamAnimation | null>>({ a: null, b: null })
	let counter = 0

	const reducedMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

	function play(team: Team, delta: number) {
		if (reducedMotion || delta === 0) return
		animations[team] = { ...scoreAnimation(delta, looks.value[team]), key: ++counter }
	}

	return { animations, play }
}
