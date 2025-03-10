'use strict';

import * as PIXI from 'pixi.js'

import * as SCREEN_INTRO from './screen_intro.js'
import * as SCREEN_DIKTAT from './screen_diktat.js'
import * as SCREEN_HIGH_SCORE from './screen_high_score.js'
import * as SCREEN_PLAYER_INFO from './screen_player_info.js'

import * as PHASES from './phases.js'
import * as TEXT from './text'
import * as CONNECT from './libs/connect'

var user_profile // struktura, ktora je naparsovana zo serveru z odpovede na SERVER.send_request_for_user_profile_from_server

// Create the PIXI application and attach it to the container
const container = document.getElementById('display');
let diktatApp = new PIXI.Application({
	resizeTo: container,
    antialias: true,
    backgroundColor: 0xe0e0e0,
    forceCanvas: true
});

// spracovanie parametrov z URL
{
	const queryString = window.location.search;
	//console.log('URL params'+queryString);
	const urlParams = new URLSearchParams(queryString);
	const survey_only = urlParams.get('prieskum')
	if ('ano' == survey_only) PHASES.setSimpleSurveyMode(true)
}

window.onresize = function (event){
	windowSizeChanged()
}

document.addEventListener('DOMContentLoaded', () => {
	windowSizeChanged();
	// spusti hru
	CONNECT.send_request_for_user_profile_from_server()
	addPollers()
	TEXT.calculateSentencesHash()
	SCREEN_INTRO.initialize(diktatApp)
	goPhase(PHASES.PHASE_INTRO_SCREEN)
	//goPhase(PHASES.PHASE_ENTERING_PLAYER_INFO)
	//goPhase(PHASES.PHASE_ENTERING_LETTERS)
})

function windowSizeChanged()
{
	// zisti rodicovski element
	const container = document.getElementById('display');
	
	// vipnutie HTML flex - uz nie je potrebne, lebo bolo odstranene z CSS
	//container.style.display = "block"
	var w = container.clientWidth 
	var h = container.clientHeight
	
	console.log("diktatApp:windowSizeChanged: " + w + "," + h);
	diktatApp.renderer.resize(w,h);
	
	// pre mobil - abi bolo mozne skrolovat pomocou dotiku, zakazanie odchitavania posuvania
	diktatApp.renderer.plugins.interaction.autoPreventDefault = false
	diktatApp.renderer.view.style.touchAction = 'auto';
	
	// viber medzi horizontalnim a vertikalnim rozlozenim, potrebne pre mobili
	var horizontal=false
	if (h<w*0.8) horizontal=true
	SCREEN_INTRO.windowSizeChanged(w,h,horizontal)
	SCREEN_DIKTAT.windowSizeChanged(w,h,horizontal)
}

function goPhase(new_phase)
{
	console.log("goPhase"+new_phase)
	PHASES.setPhase(new_phase)
	switch (PHASES.phase)
	{
		case PHASES.PHASE_INTRO_SCREEN:
			SCREEN_INTRO.showScreen()
			SCREEN_INTRO.buttonWithYpsilon.addEventListeners(
				['mousedown', 'tap'], buttonStartWithYpsilonClicked)
			SCREEN_INTRO.buttonWithoutYpsilon.addEventListeners(
				['mousedown', 'tap'], buttonStartWithoutYpsilonClicked)
			break
		case PHASES.PHASE_ENTERING_LETTERS:
			SCREEN_INTRO.hide()
			SCREEN_DIKTAT.initialize(diktatApp)
			SCREEN_DIKTAT.setUseSquares(true)
			user_profile = CONNECT.get_user_profile()
			TEXT.markSentencesFilledByProfile(user_profile)
			console.log("User Profile:"+user_profile)
			if (SCREEN_DIKTAT.getWords() == '' || !TEXT.is_new_orthography)
			{
				SCREEN_DIKTAT.generateNewText(user_profile)
			}
			SCREEN_DIKTAT.showGameScreen()
			SCREEN_DIKTAT.buttonNextPhase.addEventListeners(
				['mousedown', 'tap'], buttonNextPhaseClicked)
			break
		case PHASES.PHASE_SHOWING_RESULTS:
			SCREEN_DIKTAT.showCorrectnessResults()
			// uzivatel viplnil vsetki pismena
			var ortography='y2000'
			TEXT.markLastSentenceAsFilled()
			if (TEXT.is_new_orthography) ortography='jednoi2017'
			var data =
			{
				data:
				{
					pravopis: ortography,
					prieskum: PHASES.isSimpleSurveyModeActive(),
					veta: SCREEN_DIKTAT.getWords(),
					slova_hash: SCREEN_DIKTAT.getWordsHash(),
					viplnena: SCREEN_DIKTAT.getWordsWithAnswers(),
					chibi: SCREEN_DIKTAT.getNumberOfMistakes(),
					zoznam_iy: SCREEN_DIKTAT.getListOfWildcards(),
					kurzor_stvorec: SCREEN_DIKTAT.getUseSquares(),
					priebeh: SCREEN_DIKTAT.getTimeline(),
				}
			}
			CONNECT.post('sentence_record',data,SCREEN_DIKTAT.getWordsHash())
			if (PHASES.isSimpleSurveyModeActive())
			{
				goPhase(PHASES.PHASE_ENTERING_LETTERS)
			}
			else
			{
				if (TEXT.is_new_orthography)
				{
					var text = 'Počet chýb: 0'
					text += "\nSkúsiť inú vetu"
					SCREEN_DIKTAT.buttonNextPhase.setText(text)
					SCREEN_DIKTAT.buttonNextPhase.alpha = 1
				}
				else
				{
					var text = 'Počet chýb: '+SCREEN_DIKTAT.getNumberOfMistakes()
					text += "\nSkúsiť nový pravopis"
					SCREEN_DIKTAT.buttonNextPhase.setText(text)
					var alpha = 1
					if (SCREEN_DIKTAT.getNumberOfMistakes())
					{
						alpha=0.7 // abi bolo vidiet chibi poza tlacitko
						SCREEN_DIKTAT.buttonNextPhase.setBackgroundColor(0xff0000)
					}
					SCREEN_DIKTAT.buttonNextPhase.alpha = alpha
				}

			}
			break
		case PHASES.PHASE_SHOWING_HIGH_SCORE:
			SCREEN_DIKTAT.hide()
			SCREEN_HIGH_SCORE.initialize(diktatApp)
			SCREEN_HIGH_SCORE.showScreen()
			break
		case PHASES.PHASE_ENTERING_PLAYER_INFO:
			SCREEN_PLAYER_INFO.initialize(diktatApp)
			SCREEN_PLAYER_INFO.showScreen()
	}
}

var app_elapsed_time=0
function addPollers()
{
	diktatApp.ticker.add((delta) => {
		app_elapsed_time += delta;
		switch (PHASES.phase)
		{
			case PHASES.PHASE_INTRO_SCREEN:
				if (CONNECT.is_user_profile_received())
				{
					if (PHASES.isSimpleSurveyModeActive())
					{
						goPhase(PHASES.PHASE_ENTERING_LETTERS);
					}
				}
				if (CONNECT.runningLocally())
				{
					// pre richle testovanie - intro screen sa preskoci
					//goPhase(PHASES.PHASE_ENTERING_LETTERS);
				}
				break
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
			TEXT.setNewOrthography(false)
			SCREEN_DIKTAT.buttonNextPhase.alpha = 0
			goPhase(PHASES.PHASE_ENTERING_LETTERS)
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
