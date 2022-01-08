'use strict';

import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import { TextButton } from './button'

import * as TEXT from './text'

var cursor

// stavovi stroj
var currentCursorIndex = 0
var is_new_orthography=false
const PHASE_INTRO_SCREEN = 1
const PHASE_ENTERING_LETTERS = 2
const PHASE_SHOWING_RESULTS = 3
const PHASE_SHOWING_HIGH_SCORE = 4
var phase = PHASE_ENTERING_LETTERS

// list of letters
var letters = []
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
	if (is_new_orthography) pravopis='Nový pravopis (jedno i)'
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
	if (!is_new_orthography)
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
	if (is_new_orthography)
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
		if (is_new_orthography)
		{
			// zobrazit high score
			buttonNextPhase.alpha = 0
			goPhase(PHASE_SHOWING_HIGH_SCORE)
		}
		else
		{
			// skusit novy pravopis
			is_new_orthography = true;
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

	let letter = getWildcardLetterWithIndex(currentCursorIndex)
	letter.is_selected=true
	letter.is_selection_ypsilon=false
	if (char == 'y')
		letter.is_selection_ypsilon=true
	if (checkIfAllLettersAreFilled())
	{
		goPhase(PHASE_SHOWING_RESULTS);
	}

}

function hideCursor()
{
	cursor.box.alpha=0
}

function showCursor()
{
	cursor = {
				box: new PIXI.Graphics(),
				basex: 0,
				basey: 0,
				sourcex: 0,
				sourcey: 0,
				targetx: 0,
				targety: 0,
				phase: 0,   // 0-1 where transition from source to target
			}
	var box=cursor.box;
	box.beginFill(0xf0c020);
	box.lineStyle(3, 0xffff00, 5);
	box.drawRoundedRect(0, 0, 50, 30, 10);
	box.endFill();
	textContainer.addChild(box);
	box.alpha = 0.5
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
	if (is_new_orthography)
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
	if (cursor==0) return
	let letter = getWildcardLetterWithIndex(currentCursorIndex)
	if (letter!=0) startCursorMove(letter.sprite.x, letter.sprite.y)
}

function getWildcardLetterWithIndex(letter_index)
{
	var i=0;
	var letter_found=0
	letters.forEach((letter, index) =>
	{
		if (!letter.is_wildcard) return
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
	letters.forEach((letter, index) =>
	{
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
	letters.forEach((letter, index) =>
	{
		var correct=false
		if (!letter.is_wildcard) return
		if (!letter.is_selected) return
		if (letter.can_be_any_iy) correct=true
		if (letter.is_selection_ypsilon && letter.should_be_ypsilon) correct=true
		if (!letter.is_selection_ypsilon && !letter.should_be_ypsilon) correct=true
		if (!letter.is_selection_ypsilon && is_new_orthography) correct=true
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
	if (!is_new_orthography)
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
	hideCursor()
	letters.forEach((letter, index) =>
	{
		if (!letter.is_wildcard) return
		addMark(letter, letter.is_correct)
	})
}

function startCursorMove(targetx,targety)
{
	var c=cursor
	c.targetx = targetx
	c.targety = targety
	c.sourcex = c.basex
	c.sourcey = c.basey
	c.phase = 0
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
  elapsed=0;
  textContainer.removeChildren()
	showBackground()
	letters=[]
	currentCursorIndex = 0
	var wordListChallenge = TEXT.generateNewText()
  	var wordListJoined = wordListChallenge.join(', ')
	console.log("showText: "+wordListJoined)

	let max_lines_count=8;
	let line_size_y=30;
	let leftx=-200;
	let rightx=200;
	let basex=leftx;
	let basey=-line_size_y*max_lines_count/2;
	let index=0;
	for (let i = 0; i < wordListJoined.length; i++)
	{
		var char=wordListJoined[i];
		var char_alternative='i';
		var should_be_ypsilon=false;
		var can_be_any_iy=false;
		var is_wildcard=false;
		var color = 0x606060;
		var is_long=false;
		if (char=='y' || char=='ý') should_be_ypsilon = true;
		if (char=='i' || char=='y' || char==TEXT.KTOREKOLVEK_IY_KRATKE)
		{
			is_wildcard=true;
		}
		if (char=='í' || char=='ý' || char==TEXT.KTOREKOLVEK_IY_DLHE)
		{
			is_wildcard=true;
			is_long=true;
			char_alternative='í';
		}
		if (is_wildcard)
		{
			color = 0x8000ff;
			char='y';
			if (is_long) char='ý';
		}
		if (char==TEXT.KTOREKOLVEK_IY_KRATKE || char==TEXT.KTOREKOLVEK_IY_DLHE) can_be_any_iy = true;
		const letter = {
	        sprite: new PIXI.Text(char,
					{ fontFamily : STYLES.fontFamily,
						fontSize: 24,
						fill : color,
						align : 'center'}),
					sprite2: new PIXI.Text(char_alternative,
					{ fontFamily : STYLES.fontFamily,
						fontSize: 24,
						fill : color,
						align : 'center'}),
					char: char,
					is_wildcard: is_wildcard,
					is_long: is_long,
					index: index,
					is_selected: false,          // true ak uzivatel zvolil nejake pismeno i/y
					is_selection_ypsilon: false,
					should_be_ypsilon: should_be_ypsilon,
					can_be_any_iy: can_be_any_iy,
					is_correct: false, // true ak je visledok spravni
					mark: null, // graficki simbol pre zobrazenie ne/spravnosti (is_correct)
	    };
	    //letter.sprite.anchor.x = 0.5;
	    //letter.sprite.anchor.y = 0.7;
			let s=letter.sprite
			let s2=letter.sprite2
			s.x = basex;
			s2.x = basex;
			s.y = basey;
			s2.y = basey;
			s2.alpha = 0; // neviditelna alternativa
	    textContainer.addChild(s);
			if (is_wildcard)
			{
				textContainer.addChild(letter.sprite2);
				index++;
			}
			//gameScreen.addChild(letter.sprite);
			//console.log("Pismeno "+i+" zobrazene na "+basex+","+basey);
	    letters.push(letter);
			// generuj poziciu dalsieho pismena
			basex+=letter.sprite.width
			if (basex>rightx)
			{
				// prechod na novi riadok
				// hladaj poslednu medzeru
				let pocetPismenNaPresun=0;
				let id=i;
				while (letters[id].char!=' ')
				{
					id--;
					pocetPismenNaPresun++;
					if (id==0) break; // ak bi tam nahodou nebola
				}
				if (pocetPismenNaPresun>0) id++;
				// posun slovo z predchadzajuceho riadku na novi riadok
				basex=leftx;
				basey+=line_size_y;
				for (let j=0;j<pocetPismenNaPresun;j++)
				{
					//console.log("Presun pismeno "+letters[id+j].char);
					let s=letters[id+j].sprite;
					let s2=letters[id+j].sprite2;
					s.x = basex;
					s2.x = basex;
					s.y = basey;
					s2.y = basey;
					basex+=s.width;
				}
			}
	}
	addLettersAnimation();
}

function addLettersAnimation()
{
	// nastav polohu nedefinovanich pismen
	letters.forEach(setLettersPosition);

	diktatApp.ticker.add((delta) => {
			elapsed += delta;
			// pohibuj so zatial nedefinovanimi pismenami
			letters.forEach(animateLetter);
			animateTextContainer();
			animateCursor();
			if (PHASE_SHOWING_RESULTS == phase) letters.forEach(animateMark);
	})
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

function animateCursor()
{
	if (cursor==0) return
	var c = cursor
	var box = c.box

	if (c.phase<1)
	{
		// posun kurzor na novu poziciu targetx,targety pocas phase 0-1
		c.basex = c.sourcex + (c.targetx-c.sourcex)*c.phase
		c.basey = c.sourcey + (c.targety-c.sourcey)*c.phase
		c.phase += 0.1
	}

	var size = 30+5*Math.cos(elapsed / 10.0)
	box.x = cursor.basex-size/2
	box.y = cursor.basey-size/2
	box.width = size
	box.height = size
}

function setLettersPosition(letter)
{
	if (!letter.is_wildcard) return
	let s = letter.sprite
	//let s=letter.sprite;
	s.pivot.set(s.width/2,s.height/2);
	s.x+=s.width/2;
	s.y+=s.height/2;
	s.scale.set(0.9,0.9);
	s = letter.sprite2
	s.pivot.set(s.width/2,s.height/2);
	s.x+=s.width*1;
	s.y+=s.height/2;
}

function animateLetter(letter)
{
	if (!letter.is_wildcard) return;
	let s=letter.sprite
	let s2=letter.sprite2
	if (letter.is_selected)
	{
		s.alpha = 0
		s2.alpha = 0
		s.angle = 0
		s2.angle = 0
		if (letter.is_selection_ypsilon)
			s.alpha = 1
		else
			s2.alpha = 1
	}
	else
	{
		let angle=10*Math.cos(elapsed / 13.0+letter.index)
		s.angle = angle
		s2.angle = angle
		// viditelnost medzi sprite a sprite2
		if (is_new_orthography)
		{
			s.alpha = 0
			s2.alpha = 1
		}
		else
		{
			let alpha = 0.5+0.5*Math.cos(elapsed / 20.0 + 2.5*letter.index)
			s.alpha = alpha
			s2.alpha = 1-alpha
		}
	}
}

function animateMark(letter)
{
	var mark = letter.mark
	if (!mark) return;
	let alpha = 0.4+0.1*Math.cos(elapsed / 10.0)
	if (!letter.is_correct)
	{
		var s=mark.box
		s.alpha = alpha
		//s.scale.set(alpha)
	}
}

export default diktatApp
