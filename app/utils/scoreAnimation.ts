import { formatDelta } from './placar'
import type { TeamLook } from './teamColors'

/**
 * Como animar uma jogada (HANDOFF, seção 5). Só é chamada quando chega um INSERT em PlacarEvent:
 * reiniciar e desfazer apagam jogadas e nunca chegam aqui.
 */
export interface ScoreAnimation {
	/** 'up': o número pula; 'down': o número afunda */
	kind: 'up' | 'down'
	/** Texto que sobe e some: "+3" ou "−1" */
	text: string
	/** Cor do texto flutuante: verde ao somar, vermelho ao tirar */
	textColor: string
	/** Só pontos positivos fazem o painel piscar */
	flash: boolean
	/** Fundo do brilho: cor do time a ~18% (alfa 2e); time com c1 preto usa branco a 8% */
	glow: string
	/** Contorno de 2px do brilho: cor do time; time com c1 preto usa a 2ª cor ou branco */
	glowEdge: string
}

const BLACK = '#0a0a0a'

export function scoreAnimation(delta: number, look: TeamLook): ScoreAnimation {
	const up = delta > 0
	const dark = look.c1 === BLACK

	return {
		kind: up ? 'up' : 'down',
		text: formatDelta(delta),
		textColor: up ? '#05df72' : '#ff6467',
		flash: up,
		glow: dark ? 'rgba(255,255,255,0.08)' : `${look.c1}2e`,
		glowEdge: dark ? (look.c2 ?? '#ffffff') : look.c1,
	}
}
