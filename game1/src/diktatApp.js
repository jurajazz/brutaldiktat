'use strict';

import * as PIXI from 'pixi.js'

import * as SCREEN_INTRO from './screen_intro.js'
import * as SCREEN_DIKTAT from './screen_diktat.js'
import * as SCREEN_HIGH_SCORE from './screen_high_score.js'

import * as PHASES from './phases.js'
import * as TEXT from './text'
import * as CONNECT from './libs/connect'

var user_profile // struktura, ktora je naparsovana zo serveru z odpovede na SERVER.send_request_for_user_profile_from_server

// hlavni aplikacni objekt
let diktatApp = new PIXI.Application({
	resizeTo: window,
	antialias: true, // graphics RoundRectangle/drawRoundedRect
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: 0xe0e0e0,
	forceCanvas: true
});

// spracovanie parametrov z URL
{
	const queryString = window.location.search;
	//console.log('URL params'+queryString);
	const urlParams = new URLSearchParams(queryString);
	const survey_only = urlParams.get('iba_prieskum_nie_hra')
	if ('ano' == survey_only)
	{
		console.log('Survey only mode')
		PHASES.setSimpleSurveyMode(true)
	}
}

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
	console.log("goPhase"+new_phase)
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
					kurzor_stvorec: SCREEN_DIKTAT.setUseSquares(),
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
					SCREEN_DIKTAT.buttonNextPhase.setText("Zobraziť vyhodnotenie")
				}
				else
				{
					SCREEN_DIKTAT.buttonNextPhase.setText("Skúsiť nový pravopis")
				}
				SCREEN_DIKTAT.buttonNextPhase.alpha = 1
			}
			break
		case PHASES.PHASE_SHOWING_HIGH_SCORE:
			SCREEN_DIKTAT.hide()
			SCREEN_HIGH_SCORE.initialize(diktatApp)
			SCREEN_HIGH_SCORE.showScreen()
			break
	}
}

// spusti hru
CONNECT.send_request_for_user_profile_from_server()
addPollers()
TEXT.calculateSentencesHash()
goPhase(PHASES.PHASE_INTRO_SCREEN)
//goPhase(PHASES.PHASE_ENTERING_LETTERS)

var app_elapsed_time=0
function addPollers()
{
	diktatApp.ticker.add((delta) => {
		app_elapsed_time += delta;
		switch (PHASES.phase)
		{
			case PHASES.PHASE_INTRO_SCREEN:
				if (PHASES.isSimpleSurveyModeActive())
				{
					if (CONNECT.is_user_profile_received())
					{
						goPhase(PHASES.PHASE_ENTERING_LETTERS);
					}
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
