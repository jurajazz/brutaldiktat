
// stavovi stroj
export const PHASE_INTRO_SCREEN = 1
export const PHASE_ENTERING_LETTERS = 2
export const PHASE_SHOWING_RESULTS = 3
export const PHASE_SHOWING_HIGH_SCORE = 4
export var phase = PHASE_ENTERING_LETTERS

export function setPhase(p)
{
	phase = p
}
