'use strict';

import * as PIXI from 'pixi.js'

import * as SCREEN_INTRO from './screen_intro.js'
import * as SCREEN_DIKTAT from './screen_diktat.js'
import * as SCREEN_HIGH_SCORE from './screen_high_score.js'

import * as PHASES from './phases.js'
import * as TEXT from './text'

// Create the application helper and add its render target to the page
let diktatApp = new PIXI.Application({
	resizeTo: window,
	antialias: true, // graphics RoundRectangle/drawRoundedRect
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: 0xe0e0e0,
	forceCanvas: true
});

window.innerHeight = window.innerHeight*0.95 // docasna kompenzacia dolneho bieleho pruhu

window.onresize = function (event){
	var w = window.innerWidth;
	var h = window.innerHeight;
	//console.log("window.onresize: " + w + "," + h);
}

function windowSizeChanged(w,h)
{
	// viber medzi horizontalnim a vertikalnim rozlozenim, potrebne pre mobili
	var horizontal=false
	if (h<w*0.8) horizontal=true
	SCREEN_INTRO.windowSizeChanged(w,h,horizontal)
	SCREEN_DIKTAT.windowSizeChanged(w,h,horizontal)
}

windowSizeChanged(window.innerWidth, window.innerHeight);

function goPhase(new_phase)
{
	PHASES.setPhase(new_phase)
	switch (PHASES.phase)
	{
		case PHASES.PHASE_INTRO_SCREEN:
			SCREEN_INTRO.initialize(diktatApp)
			SCREEN_INTRO.showScreen()
			SCREEN_INTRO.buttonWithYpsilon.addEventListeners(
				['mousedown', 'tap'], buttonStartWithYpsilonClicked)
			SCREEN_INTRO.buttonWithoutYpsilon.addEventListeners(
				['mousedown', 'tap'], buttonStartWithoutYpsilonClicked)
			break
		case PHASES.PHASE_ENTERING_LETTERS:
			SCREEN_INTRO.hide()
			SCREEN_DIKTAT.initialize(diktatApp)
			SCREEN_DIKTAT.showGameScreen()
			SCREEN_DIKTAT.buttonNextPhase.addEventListeners(
				['mousedown', 'tap'], buttonNextPhaseClicked)
			break
		case PHASES.PHASE_SHOWING_RESULTS:
			SCREEN_DIKTAT.showCorrectnessResults()
			if (TEXT.is_new_orthography)
			{
				SCREEN_DIKTAT.buttonNextPhase.setText("Zobraziť vyhodnotenie")
			}
			else
			{
				SCREEN_DIKTAT.buttonNextPhase.setText("Skúsiť nový pravopis")
			}
			SCREEN_DIKTAT.buttonNextPhase.alpha = 1
			break
		case PHASES.PHASE_SHOWING_HIGH_SCORE:
			SCREEN_DIKTAT.hide()
			SCREEN_HIGH_SCORE.initialize(diktatApp)
			SCREEN_HIGH_SCORE.showScreen()
			break
	}
}

// spusti hru
addPollers()
goPhase(PHASES.PHASE_INTRO_SCREEN)
//goPhase(PHASES.PHASE_ENTERING_LETTERS)

var app_elapsed_time=0
function addPollers()
{
	diktatApp.ticker.add((delta) => {
		app_elapsed_time += delta;
		switch (PHASES.phase)
		{
			case PHASES.PHASE_ENTERING_LETTERS:
				if (SCREEN_DIKTAT.checkIfAllLettersAreFilled())
				{
					goPhase(PHASES.PHASE_SHOWING_RESULTS);
				}
				break;
		}
	})
}

function buttonStartWithYpsilonClicked()
{
	TEXT.setNewOrthography(false)
	goPhase(PHASES.PHASE_ENTERING_LETTERS)
}

function buttonStartWithoutYpsilonClicked()
{
	TEXT.setNewOrthography(true)
	goPhase(PHASES.PHASE_ENTERING_LETTERS)
}

function buttonNextPhaseClicked()
{
	if (PHASES.phase == PHASES.PHASE_SHOWING_RESULTS)
	{
		if (TEXT.is_new_orthography)
		{
			// zobrazit high score
			SCREEN_DIKTAT.buttonNextPhase.alpha = 0
			goPhase(PHASES.PHASE_SHOWING_HIGH_SCORE)
		}
		else
		{
			// skusit novy pravopis
			TEXT.setNewOrthography(true)
			SCREEN_DIKTAT.buttonNextPhase.alpha = 0
			goPhase(PHASES.PHASE_ENTERING_LETTERS)
		}
	}
}

export default diktatApp
