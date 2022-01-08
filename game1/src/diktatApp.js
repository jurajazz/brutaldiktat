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

window.onresize = function (event){
	var w = window.innerWidth;
	var h = window.innerHeight;
	//console.log("window.onresize: " + w + "," + h);
}

function goPhase(new_phase)
{
	PHASES.setPhase(new_phase)
	switch (PHASES.phase)
	{
		case PHASES.PHASE_INTRO_SCREEN:
			showIntroScreen();
			break;
		case PHASES.PHASE_ENTERING_LETTERS:
			SCREEN_DIKTAT.initialize(diktatApp)
			SCREEN_DIKTAT.showGameScreen()
			SCREEN_DIKTAT.getButtonNextPhase().on('mousedown', buttonNextPhaseClicked)
			break;
		case PHASES.PHASE_SHOWING_RESULTS:
			SCREEN_DIKTAT.showCorrectnessResults();
			if (TEXT.is_new_orthography)
			{
				SCREEN_DIKTAT.getButtonNextPhase().setText("Zobraziť vyhodnotenie")
			}
			else
			{
				SCREEN_DIKTAT.getButtonNextPhase().setText("Skúsiť nový pravopis")
			}
			SCREEN_DIKTAT.getButtonNextPhase().alpha = 1
			break;
		case PHASES.PHASE_SHOWING_HIGH_SCORE:
			SCREEN_DIKTAT.hide()
			break;
	}
}

// spusti hru
addPollers()
goPhase(PHASES.PHASE_ENTERING_LETTERS)

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

function buttonNextPhaseClicked()
{
	if (PHASES.phase == PHASES.PHASE_SHOWING_RESULTS)
	{
		if (TEXT.is_new_orthography)
		{
			// zobrazit high score
			SCREEN_DIKTAT.getButtonNextPhase().alpha = 0
			goPhase(PHASES.PHASE_SHOWING_HIGH_SCORE)
		}
		else
		{
			// skusit novy pravopis
			TEXT.setNewOrthography(true)
			SCREEN_DIKTAT.getButtonNextPhase().alpha = 0
			goPhase(PHASES.PHASE_ENTERING_LETTERS)
		}
	}
}

export default diktatApp
