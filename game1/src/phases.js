
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

export function is(p)
{
	return (p == phase)
}

var simple_survey_mode = false // zobrazuje veti v starom pravopise bez hodnotenia. Len uklada visledki

export function setSimpleSurveyMode(value)
{
	simple_survey_mode = value
}

export function isSimpleSurveyModeActive()
{
	return simple_survey_mode
}
