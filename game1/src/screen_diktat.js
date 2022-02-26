
import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import { TextButton } from './button'

import * as TEXT from './text'
import * as CURSOR from './animation/cursor'
import * as LETTER from './animation/letter'
import * as STRESSBAR from './animation/stressbar'
import * as PHASES from './phases.js'
import * as HASHES from './libs/hashes.js'

var TIME_PER_DIKTAT_INIT_PER_CHAR = 0.13 // cas, ktori sa pripocita k casu potrebnemu pre kazde pismeno (cas potrebni na zorientovanie)
var TIME_PER_WILDCARD_LETTER = 2.5 // cas, ktori je k dispozicii pre jedno pismeno

// list of letters
var letters = [] // list of objects LETTER.Letter
var elapsed=0 // total elapsed time for animations
var timeline = [] // zaznami o case, kedi boli wildcardi viplnene
var timeline_start = performance.now() // cas zobrazenia
var gameScreen;
var application=null; // napriklad diktatApp
var textContainer;

var currentCursorIndex = 0
var cursor_graphics = null // object of CURSOR.Cursor
var used_font_size = 1

var ticker = false // true ak uz je antivni

var horizontal_mode = false
var screen_width = window.innerWidth
var screen_height = window.innerHeight

var last_i_move=0
var AUTO_I_PERIOD_FRAMES=60

export function windowSizeChanged(w,h,horizontal)
{
	horizontal_mode = horizontal
	screen_width = w
	screen_height = h
}

export function initialize(app)
{
	if (application) return
	application = app

	gameScreen = new PIXI.Container();
	gameScreen.position.set(screen_width*0.5, screen_height*0.5)
	application.stage.addChild(gameScreen)

	textContainer = new PIXI.Container();
	textContainer.position.set(screen_width*0.5, screen_height*0.5)
	application.stage.addChild(textContainer)

	TEXT.cacheAllLettersWidths(50)

	if (PHASES.isSimpleSurveyModeActive())
	{
		setUseSquares(true)
	}
}

export function setUseSquares(value)
{
	LETTER.setUseSquares(value)
}
export function getUseSquares(value)
{
	return LETTER.getUseSquares()
}

function showMainLabel()
{
	var main_text = 'Brutál\nDiktát'
	var small_text='Aktuálny\npravopis'
	if (TEXT.is_new_orthography) small_text='Nový pravopis\n(jedno i)'
	if (PHASES.isSimpleSurveyModeActive())
	{
		main_text = 'Fáza\nprieskum'
		small_text = 'Ďakujeme\nza čas,\nktorý\nvenujete\nypsilonu'
	}
	if (horizontal_mode)
	{
		var ypos_big = -screen_height*0.5 + screen_height*0.05
		var ypos_small = -screen_height*0.5 + screen_height*0.05
		var fontsize_big = screen_height*0.06
		var fontsize_small = screen_height*0.04
		const label1 = new PIXI.Text(main_text,
		{ fontFamily : STYLES.fontFamily,
			fontSize: fontsize_big,
			fill : STYLES.bigFontColor,
			align : 'center'})
		label1.y = ypos_big
		label1.x = -label1.width/2 - screen_width/2 + screen_width*0.1

		var label2 = new PIXI.Text(small_text,
		{ fontFamily : STYLES.fontFamily,
			fontSize: fontsize_small,
			fill : STYLES.bigFontColor,
			align : 'center'})
		label2.y = ypos_small
		label2.x = -label2.width/2 + screen_width/2 - screen_width*0.1
		gameScreen.addChild(label1);
		gameScreen.addChild(label2);
	}
	else
	{
		// vertical mode
		main_text = main_text.replace(/\n/g, " ")
		small_text = small_text.replace(/\n/g, " ")
		var ypos_big = -screen_height*0.5 + screen_height*0.05
		var fontsize_big = screen_height*0.05
		var fontsize_small = screen_height*0.03
		var ypos_small = ypos_big + fontsize_big*1.2
		const label1 = new PIXI.Text(main_text,
		{ fontFamily : STYLES.fontFamily,
			fontSize: fontsize_big,
			fill : STYLES.bigFontColor,
			align : 'center'})
		label1.y = ypos_big
		label1.x = -label1.width/2 // center

		var label2 = new PIXI.Text(small_text,
		{ fontFamily : STYLES.fontFamily,
			fontSize: fontsize_small,
			fill : STYLES.bigFontColor,
			align : 'center'})
		label2.y = ypos_small
		label2.x = -label2.width/2 // center
		gameScreen.addChild(label1);
		gameScreen.addChild(label2);
	}
}

// Add the 'keydown' event listener to our document
document.addEventListener('keydown', onKeyboardKeyDown);

//Capture the keyboard arrow keys
function onKeyboardKeyDown(key)
{
	// https://css-tricks.com/snippets/javascript/javascript-keycodes/
	const KEY_BACKSPACE = 8
	const KEY_END = 35
	const KEY_HOME = 36
	const KEY_LEFT_ARROW = 37
	const KEY_UP_ARROW = 38
	const KEY_RIGHT_ARROW = 39
	const KEY_DOWN_ARROW = 40
	if ('I'.charCodeAt(0) == key.keyCode) buttonIclicked();
	if ('Y'.charCodeAt(0) == key.keyCode) buttonYclicked();
	if ('A'.charCodeAt(0) == key.keyCode) buttonSetAllToIClicked();
	if (KEY_BACKSPACE == key.keyCode) buttonLeftClicked();
	if (KEY_LEFT_ARROW == key.keyCode) buttonLeftClicked();
	if (KEY_RIGHT_ARROW == key.keyCode) buttonRightClicked();

}

let yButton = null
let iButton = null
let backButton = null
export let buttonNextPhase = null

function showButtons()
{
	if (horizontal_mode)
	{
		let buttonHeight=screen_width*0.1
		let y = screen_height*0.5-buttonHeight*0.5
		//console.log("showButtons h:"+window.innerHeight)
		yButton = new TextButton("y",
			buttonHeight, buttonHeight,
			-screen_width*0.5 + screen_width*0.1, y)
	      iButton = new TextButton("i",
			buttonHeight, buttonHeight,
			screen_width*0.5 - screen_width*0.1, y)
		backButton = new TextButton("<<",
			buttonHeight, buttonHeight,
			screen_width*0.5 - screen_width*0.1, y-buttonHeight*1.5)
		let y2 = window.innerHeight/2-buttonHeight*2
		buttonNextPhase = new TextButton("-",
		    400, buttonHeight,
		    0, y2)
	}
	else
	{
		// vertical mode
		let buttonHeight=screen_height*0.1
		let buttonWidth=screen_width/(3+1)
		let y = screen_height*0.5-buttonHeight*0.25
		//console.log("showButtons h:"+window.innerHeight)
		yButton = new TextButton("y",
		    buttonWidth, buttonHeight,
		    -buttonWidth*1.2, y)
	      iButton = new TextButton("i",
	    	    buttonWidth, buttonHeight,
	    	    0, y)
		backButton = new TextButton("<<",
		    buttonWidth, buttonHeight,
		    buttonWidth*1.2, y)
		let y2 = window.innerHeight/2-buttonHeight*2
		buttonNextPhase = new TextButton("-",
		    400, buttonHeight,
		    0, y2)
	}
	buttonNextPhase.alpha = 0
	gameScreen.addChild(iButton)
	if (!TEXT.is_new_orthography)
	{
		gameScreen.addChild(yButton)
		gameScreen.addChild(backButton)
	}

	iButton.addEventListeners(['mousedown', 'tap'], buttonIclicked)
	yButton.addEventListeners(['mousedown', 'tap'], buttonYclicked)
	backButton.addEventListeners(['mousedown', 'tap'], buttonLeftClicked)
}

function buttonIclicked()
{
	setCurrentPositionChar('i');
	cursorGotoNextPosition();
}
function buttonYclicked()
{
	if (TEXT.is_new_orthography)
	{
		buttonIclicked()
		return
	}
	setCurrentPositionChar('y');
	cursorGotoNextPosition();
}

function buttonRightClicked()
{
	cursorGotoNextPosition();
}

function buttonLeftClicked()
{
	cursorGotoPreviousPosition();
}

function buttonSetAllToIClicked()
{
	cursorGotoFirstPosition();
	while (!checkIfAllLettersAreFilled())
	{
		setCurrentPositionChar('i');
		cursorGotoNextPosition();
	}
}

function setCurrentPositionChar(char)
{
	if (PHASES.phase != PHASES.PHASE_ENTERING_LETTERS) return

	let l = getWildcardLetterWithIndex(currentCursorIndex)
	let letter = l.getStructure()
	var timerecord={}
	timerecord['i']=currentCursorIndex
	timerecord['ch']=char
	timerecord['ms']=Math.round(performance.now()-timeline_start)
	timeline.push(timerecord)
	letter.is_selected=true
	letter.is_selection_ypsilon=false
	letter.answer=char
	if (char == 'y')
		letter.is_selection_ypsilon=true
}

function showCursor()
{
	cursor_graphics = new CURSOR.Cursor()
	cursor_graphics.setSize(used_font_size / cursor_graphics.getDefaultSizePix())
	textContainer.addChild(cursor_graphics.getBox())
}

function showBackground()
{
	const back = new PIXI.Graphics();
	back.beginFill(0xffffff);
	//back.lineStyle(3, 0xffffff, 5);
	if (horizontal_mode)
	{
		var margin_w = screen_width*0.2
		back.drawRoundedRect(
			-screen_width*0.5+margin_w,
			-screen_height*0.5+screen_height*0.2,
			screen_width-margin_w*2,
			screen_height*0.80,
			10);
	}
	else
	{
		// vertical mode
		var margin_w = screen_width*0.05
		back.drawRoundedRect(
			-screen_width*0.5+margin_w,
			-screen_height*0.5+screen_height*0.25,
			screen_width-margin_w*2,
			screen_height*0.65,
			10);
	}
	back.endFill();
	textContainer.addChild(back);
}

export function showGameScreen()
{
	gameScreen.removeChildren()
	showMainLabel()
	last_i_move = 0
	STRESSBAR.set_horizontal_mode(horizontal_mode)
	STRESSBAR.set_GameScreen(gameScreen)
	STRESSBAR.show()
	STRESSBAR.gameStart()
	showText()
	showCursor()
	showButtons()
	cursorGotoCurrentPosition()
	if (TEXT.TESTING_FILL_ALL_I) buttonSetAllToIClicked()
	timeline_start = performance.now()
	timeline = [] // vimazanie casoveho zaznamu
}

function showIntroScreen()
{

}

export function showCorrectnessResults()
{
	evaluateCorrectness();
	// hide buttons
	yButton.alpha = 0
	iButton.alpha = 0
	backButton.alpha = 0
	// show next button
	if (TEXT.is_new_orthography)
	{
		// show goto next level
	}
	else
	{
		// offer new orthograpy button
		buttonNextPhase.alpha = 0.7
	}
	textContainer.addChild(buttonNextPhase)
}

// search for letter position on the
function cursorGotoCurrentPosition()
{
	if (cursor_graphics==null) return
	let l = getWildcardLetterWithIndex(currentCursorIndex)
	if (l!=0)
	{
		let letter = l.getStructure()
		cursor_graphics.startMove(letter.sprite.x, letter.sprite.y+used_font_size*0.1)
	}
}

function getWildcardLetterWithIndex(letter_index)
{
	var i=0;
	var letter_found=0
	letters.forEach((letter, index) =>
	{
		if (!letter.getStructure().is_wildcard) return
		if (letter_index == i)
		{
			//console.log("getWildcardLetterWithIndex found:"+letter_index)
			letter_found=letter
		}
		i++;
	})
	return letter_found
}

// skontroluje, ci su vsetki pismena viplnene
// ak ano - spusti vihodnotenie
export function checkIfAllLettersAreFilled()
{
	var some_undecided_letter_found=0
	letters.forEach((l, index) =>
	{
		let letter = l.getStructure()
		if (!letter.is_wildcard) return
		if (letter.is_selected) return
		some_undecided_letter_found = true
	})
	return !some_undecided_letter_found;
}

// funkcia vyhodnoti, ktore pismena su dobre a ktore zle
var number_of_errors=0
function evaluateCorrectness()
{
	var some_undecided_letter_found=0
	number_of_errors = 0
	letters.forEach((l, index) =>
	{
		let letter = l.getStructure()
		var correct=false
		if (!letter.is_wildcard) return
		if (!letter.is_selected) return
		if (letter.can_be_any_iy) correct=true
		if (letter.is_selection_ypsilon && letter.should_be_ypsilon) correct=true
		if (!letter.is_selection_ypsilon && !letter.should_be_ypsilon) correct=true
		if (!letter.is_selection_ypsilon && TEXT.is_new_orthography) correct=true
		letter.is_correct = correct
		if (!correct) number_of_errors += 1
	})
	markCorrectLetters()
}

export function getNumberOfMistakes()
{
	return number_of_errors
}
export function getWords()
{
	return wordListJoined
}

export function getWordsHash()
{
	//var h = sha256(getWords())
	var h = HASHES.cyrb53(getWords())
	console.log("getWordsHash dig:"+h)
	return h;
}

export function getWordsWithAnswers()
{
	var words = ''
	letters.forEach((l, index) =>
	{
		let letter = l.getStructure()
		words += letter.answer
	})
	return words
}
export function getListOfWildcards()
{
	var mistakes=[]
	letters.forEach((l, index) =>
	{
		let letter = l.getStructure()
		if (!letter.is_wildcard) return
		if (!letter.is_selected) return
		if (letter.is_correct) return
		var wc={}
		wc['id']=index
		if (letter.should_be_ypsilon)
		{
			wc['char']='y'
		}
		else
		{
			wc['char']='i'
		}
		mistakes.push(wc)
	})
	return {mistakes:mistakes}
}
export function getTimeline()
{
	return {wildcards:timeline}
}

function addMark(letter, is_correct)
{
	var mark = {
				box: new PIXI.Graphics(),
				basex: 0,
				basey: 0,
				is_correct: is_correct
			}
	var box=mark.box;
	var color = 0xff0000
	if (is_correct) color = 0x00ff00
	box.beginFill(color);
	//box.lineStyle(3, color, 5);
	var size=used_font_size*0.5
	box.drawCircle(letter.sprite.x, letter.sprite.y, size);
	box.endFill();
	box.alpha = 0.2
	if (!TEXT.is_new_orthography)
	{
		if (is_correct)
			box.alpha = 0.0
	}
	letter.mark = mark
	textContainer.addChild(box);
}

// oznaci spravne/nespravne zvolene pismena farbami
// pre aktualni pravopis len cervene, zelene len nanapadne
// pre novi pravopis len zelene :)
function markCorrectLetters()
{
	cursor_graphics.hide()
	letters.forEach((l, index) =>
	{
		let letter=l.getStructure()
		if (!letter.is_wildcard) return
		addMark(letter, letter.is_correct)
	})
}

function cursorGotoFirstPosition()
{
	currentCursorIndex=0
	cursorGotoCurrentPosition()
}

function cursorGotoNextPosition()
{
	currentCursorIndex++
	cursorGotoCurrentPosition()
	if (checkIfAllLettersAreFilled())
	{
		STRESSBAR.gameFinishedAllFilled()
	}
}

function cursorGotoPreviousPosition()
{
	if (currentCursorIndex>0) currentCursorIndex--
	cursorGotoCurrentPosition()
}

var wordListJoined=''

export function generateNewText(user_profile)
{
	// generovanie textu
	var wordListChallenge = TEXT.generateNewText(user_profile)
	wordListJoined = wordListChallenge.join(', ')
	console.log("generateNewText: "+wordListJoined)
}

function showText()
{
	textContainer.removeChildren()
	showBackground()
	elapsed = 0
	currentCursorIndex = 0
	// skus ulozit slova tak, abi sa zmestili a pritom viplnali priestor
	let max_size=70
	let min_size=10
	{
		var dstart = performance.now();
		//console.log("Drawing letters")
		LETTER.disableRender()
		for (let font_size = max_size; font_size > min_size; font_size-=2)
		{
			//console.log("Drawing letters font:"+font_size)
			letters=[]
			if (TEXT.placeLetters(wordListJoined,letters,textContainer,font_size))
			{
				letters=[]
				LETTER.enableRender()
				used_font_size = font_size
				TEXT.placeLetters(wordListJoined,letters,textContainer,font_size)
				break;
			}
		}
		//console.log("Drawing letters:"+(performance.now()-dstart)+"ms")
	}
	STRESSBAR.setTimeAvailable(0)
	STRESSBAR.resetTimeForRead()
	letters.forEach(addLetterToContainer);
	// nastav polohu nedefinovanich pismen
	letters.forEach(setLettersPosition);
	addAnimations();
}

function addLetterToContainer(letter)
{
	textContainer.addChild(letter.getStructure().sprite);
	STRESSBAR.addTimeForRead(TIME_PER_DIKTAT_INIT_PER_CHAR)
	if (letter.getStructure().is_wildcard)
	{
		STRESSBAR.addTimeAvailable(TIME_PER_WILDCARD_LETTER)
		textContainer.addChild(letter.getStructure().sprite2);
		var sq = letter.getStructure().square;
		if (sq)
			textContainer.addChild(sq);
	}
}

function addAnimations()
{
	if (ticker) return
	application.ticker.add((delta) => {
			elapsed += delta;
			// pohibuj so zatial nedefinovanimi pismenami
			letters.forEach(animateLetter);
			animateTextContainer();
			if (PHASES.isSimpleSurveyModeActive()) STRESSBAR.animateProgress(elapsed);
			if (!PHASES.isSimpleSurveyModeActive()) STRESSBAR.animateStress(elapsed);
			if (cursor_graphics) cursor_graphics.animate(elapsed);
			if (PHASES.PHASE_SHOWING_RESULTS == PHASES.phase) letters.forEach(animateMark);
			if (TEXT.is_new_orthography) moveSingleIForward();
	})
	ticker=true
}

function setLettersPosition(letter) { letter.initPosition() }
function animateLetter(letter) { letter.animate(elapsed) }
function animateMark(letter) {letter.animateMark(elapsed) }

function moveSingleIForward()
{
	if (elapsed - last_i_move > AUTO_I_PERIOD_FRAMES)
	{
		//console.log("moveSingleIForward:"+elapsed+","+last_i_move)
		last_i_move = elapsed
		buttonIclicked()
	}
}

function animateTextContainer()
{
	let max_frames=50
	if (elapsed > max_frames)
	{
		let scale=1
		textContainer.scale.set(scale,scale)
		return // koniec animacie
	}
	let scale=1-(max_frames-elapsed)/max_frames*0.1*Math.cos(elapsed / 3.0)
	textContainer.scale.set(scale,scale)
}

// zneviditelni vsetki casti
export function hide()
{
	application.stage.removeChildren()
}
