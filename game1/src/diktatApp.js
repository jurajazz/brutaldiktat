'use strict';

import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import { TextButton } from './button'

import * as TEXT from './text'
import * as CURSOR from './animation/cursor'
import * as LETTER from './animation/letter'

// stavovi stroj
var currentCursorIndex = 0
var cursor_graphics = null // object of CURSOR.Cursor
const PHASE_INTRO_SCREEN = 1
const PHASE_ENTERING_LETTERS = 2
const PHASE_SHOWING_RESULTS = 3
const PHASE_SHOWING_HIGH_SCORE = 4
var phase = PHASE_ENTERING_LETTERS

// list of letters
var letters = [] // list of objects LETTER.Letter
var elapsed=0 // total elapsed time for animations

// Create the application helper and add its render target to the page
let diktatApp = new PIXI.Application({
	resizeTo: window,
	antialias: true, // graphics RoundRectangle/drawRoundedRect
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: 0xe0e0e0,
	forceCanvas: true
});

// Add the 'keydown' event listener to our document
document.addEventListener('keydown', onKeyboardKeyDown);

window.onresize = function (event){
	var w = window.innerWidth;
	var h = window.innerHeight;
	//console.log("window.onresize: " + w + "," + h);
}

let gameScreen = new PIXI.Container();
gameScreen.position.set(window.innerWidth/2, window.innerHeight/2)
diktatApp.stage.addChild(gameScreen)

let textContainer = new PIXI.Container();
textContainer.position.set(window.innerWidth/2, window.innerHeight*0.5)
diktatApp.stage.addChild(textContainer)

var label2=null
function showMainLabel()
{
	let y = -window.innerHeight/2 + 40
	const label1 = new PIXI.Text('Brutál Diktát',
	{ fontFamily : STYLES.fontFamily,
		fontSize: 80,
		fill : 0x000000,
		align : 'center'})
	label1.y = y
	label1.x = -label1.width/2 // center
	gameScreen.addChild(label1);

	var pravopis='Aktuálny pravopis'
	if (TEXT.is_new_orthography) pravopis='Nový pravopis (jedno i)'
	if (label2) gameScreen.removeChild(label2);
	label2 = new PIXI.Text(pravopis,
	{ fontFamily : STYLES.fontFamily,
		fontSize: 30,
		fill : 0x000000,
		align : 'center'})
	label2.y = y+80
	label2.x = -label2.width/2 // center
	gameScreen.addChild(label2);
}

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
let buttonNextPhase = null

function showButtons()
{
	let buttonHeight=40
	let y = window.innerHeight/2-buttonHeight
	//console.log("showButtons h:"+window.innerHeight)
	yButton = new TextButton("y",
	    100, buttonHeight,
	    -120, y)
      iButton = new TextButton("i",
    	    -100, buttonHeight,
    	    0, y)
	backButton = new TextButton("<<",
	    100, buttonHeight,
	    +120, y)
	let y2 = window.innerHeight/2-buttonHeight*2
	buttonNextPhase = new TextButton("Skúsiť nový pravopis",
	    400, buttonHeight,
	    0, y2)
	gameScreen.addChild(buttonNextPhase)
	buttonNextPhase.alpha = 0
	gameScreen.addChild(iButton)
	if (!TEXT.is_new_orthography)
	{
		gameScreen.addChild(yButton)
		gameScreen.addChild(backButton)
	}

	iButton.on('mousedown', buttonIclicked)
	yButton.on('mousedown', buttonYclicked)
	backButton.on('mousedown', buttonLeftClicked)
	buttonNextPhase.on('mousedown', buttonNextPhaseClicked)
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

function buttonNextPhaseClicked()
{
	if (phase == PHASE_SHOWING_RESULTS)
	{
		if (TEXT.is_new_orthography)
		{
			// zobrazit high score
			buttonNextPhase.alpha = 0
			goPhase(PHASE_SHOWING_HIGH_SCORE)
		}
		else
		{
			// skusit novy pravopis
			TEXT.setNewOrthography(true)
			buttonNextPhase.alpha = 0
			goPhase(PHASE_ENTERING_LETTERS)
		}
	}
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
	if (phase != PHASE_ENTERING_LETTERS) return

	let l = getWildcardLetterWithIndex(currentCursorIndex)
	let letter = l.getStructure()
	letter.is_selected=true
	letter.is_selection_ypsilon=false
	if (char == 'y')
		letter.is_selection_ypsilon=true
	if (checkIfAllLettersAreFilled())
	{
		goPhase(PHASE_SHOWING_RESULTS);
	}

}

function showCursor()
{
	cursor_graphics = new CURSOR.Cursor()
	textContainer.addChild(cursor_graphics.getBox())
}

function showBackground()
{
	const back = new PIXI.Graphics();
	back.beginFill(0xffffff);
	//back.lineStyle(3, 0xffffff, 5);
	back.drawRoundedRect(-250, -180, 500, 400, 10);
	back.endFill();
	textContainer.addChild(back);
}

goPhase(PHASE_ENTERING_LETTERS)

function showGameScreen()
{
	showText()
	showCursor()
	showButtons()
	showMainLabel()
	cursorGotoCurrentPosition()
	if (TEXT.TESTING_FILL_ALL_I) buttonSetAllToIClicked()
}

function showIntroScreen()
{

}

function showCorrectnessResults()
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
		buttonNextPhase.alpha = 1
	}
}

function goPhase(new_phase)
{
	phase = new_phase
	switch (phase)
	{
		case PHASE_ENTERING_LETTERS:
			showGameScreen()
			break;
		case PHASE_SHOWING_RESULTS:
			showCorrectnessResults();
			break;
		case PHASE_INTRO_SCREEN:
			showIntroScreen();
			break;
	}
}

// search for letter position on the
function cursorGotoCurrentPosition()
{
	if (cursor_graphics==null) return
	let l = getWildcardLetterWithIndex(currentCursorIndex)
	if (l!=0)
	{
		let letter = l.getStructure()
		cursor_graphics.startMove(letter.sprite.x, letter.sprite.y)
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
function checkIfAllLettersAreFilled()
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
function evaluateCorrectness()
{
	var some_undecided_letter_found=0
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
	})
	markCorrectLetters()
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
	var size=15
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
}

function cursorGotoPreviousPosition()
{
	if (currentCursorIndex>0) currentCursorIndex--
	cursorGotoCurrentPosition()
}

function showText()
{
	textContainer.removeChildren()
	showBackground()
	elapsed = 0
	currentCursorIndex = 0
	letters=[]
	TEXT.placeLetters(letters)
	letters.forEach(addLetterToContainer);
	addAnimations();
}

function addLetterToContainer(letter)
{
	textContainer.addChild(letter.getStructure().sprite);
	if (letter.getStructure().is_wildcard)
	{
		textContainer.addChild(letter.getStructure().sprite2);
	}
}

function addAnimations()
{
	// nastav polohu nedefinovanich pismen
	letters.forEach(setLettersPosition);

	diktatApp.ticker.add((delta) => {
			elapsed += delta;
			// pohibuj so zatial nedefinovanimi pismenami
			letters.forEach(animateLetter);
			animateTextContainer();
			if (cursor_graphics) cursor_graphics.animate(elapsed);
			if (PHASE_SHOWING_RESULTS == phase) letters.forEach(animateMark);
	})
}

function setLettersPosition(letter) { letter.initPosition() }
function animateLetter(letter) { letter.animate(elapsed) }
function animateMark(letter) {letter.animateMark(elapsed) }

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


export default diktatApp
