import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import diktatData from "../assets/diktat-data.yaml"
import { TextButton } from './button'

var cursor
var currentCursorIndex = 0
var wordListJoined = ""
var wordListChallenge = []
const KTOREKOLVEK_IY_KRATKE = 'ǒ'
const KTOREKOLVEK_IY_DLHE = 'Ǒ'

// list of letters
var letters = []
var elapsed=0 // total elapsed time for animations

// Create the application helper and add its render target to the page
let diktatApp = new PIXI.Application({
	  resizeTo: window,
		antialias: true, // graphics RoundRectangle
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xd0d0d0,
    forceCanvas: true
});

window.onresize = function (event){
    var w = window.innerWidth;
    var h = window.innerHeight;
		console.log("window.onresize: " + w + "," + h);
}

function pickRandomWord(database) {
    let selectedWord = database.data.slova[Math.floor(Math.random() * database.data.slova.length)]
    return selectedWord.slovo
}

let gameScreen = new PIXI.Container();
gameScreen.position.set(window.innerWidth/2, window.innerHeight/2)
diktatApp.stage.addChild(gameScreen)

let textContainer = new PIXI.Container();
textContainer.position.set(window.innerWidth/2, window.innerHeight*0.5)
diktatApp.stage.addChild(textContainer)

function showButtons()
{
	let buttonHeight=40
	let y = window.innerHeight/2-buttonHeight
	//console.log("showButtons h:"+window.innerHeight)
	let iButton = new TextButton("i",
	    -100, buttonHeight,
	    -120, y)

	let yButton = new TextButton("y",
	    100, buttonHeight,
	    0, y)
	let backButton = new TextButton("<<",
	    100, buttonHeight,
	    +120, y)
	gameScreen.addChild(iButton)
	gameScreen.addChild(yButton)
	gameScreen.addChild(backButton)

	iButton.on('mousedown', buttonIclicked)
	yButton.on('mousedown', buttonYclicked)
	backButton.on('mousedown', backClicked)
}

function buttonIclicked()
{
	setCurrentPositionChar('i');
	cursorGotoNextPosition();
}
function buttonYclicked()
{
	setCurrentPositionChar('y');
	cursorGotoNextPosition();
}

function backClicked()
{
	cursorGotoPreviousPosition();
}

function setCurrentPositionChar(char)
{
	let letter = getWildcardLetterWithIndex(currentCursorIndex)
	letter.is_selected=true
	letter.is_selection_ypsilon=false
	if (char == 'y')
		letter.is_selection_ypsilon=true
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
}

showGameScreen()

function showGameScreen()
{
	showNewText()
	showCursor()
	showButtons()
	cursorGotoCurrentPosition()
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

function startCursorMove(targetx,targety)
{
	var c=cursor
	c.targetx = targetx
	c.targety = targety
	c.sourcex = c.basex
	c.sourcey = c.basey
	c.phase = 0
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

function showNewText ()
{
	// generovanie zoznamu slov
  const wordList = []
  while (wordList.length < 20)
	{
    let word = pickRandomWord(diktatData)
    if (!wordList.includes(word)) wordList.push(word)
	}
	wordListChallenge=[];
  wordList.forEach((element, index) =>
	{
			  let e=element;
				e=e.replace(/\[iy\]/g, KTOREKOLVEK_IY_KRATKE);
				e=e.replace(/\[íý\]/g, KTOREKOLVEK_IY_DLHE);
        wordListChallenge.push(e)
  });

  currentCursorIndex = 0
  showText()
}

function showText()
{
  elapsed=0;
  textContainer.removeChildren()
	letters=[];
  wordListJoined = wordListChallenge.join(', ')
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
		var is_wildcard=false;
		var color = 0x606060;
		var is_long=false;
		if (char=='i' || char=='y' || char==KTOREKOLVEK_IY_KRATKE)
		{
			is_wildcard=true;
		}
		if (char=='í' || char=='ý' || char==KTOREKOLVEK_IY_DLHE)
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
		const letter = {
	        sprite: new PIXI.Text(char,
					{ fontFamily : 'Arial',
						fontSize: 24,
						fill : color,
						align : 'center'}),
					sprite2: new PIXI.Text(char_alternative,
					{ fontFamily : 'Arial',
						fontSize: 24,
						fill : color,
						align : 'center'}),
					char: char,
					is_wildcard: is_wildcard,
					is_long: is_long,
					index: index,
					is_selected: false,          // true if user select one of letters
					is_selection_ypsilon: false,
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
	box.alpha = 0.5
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
		let alpha = 0.5+0.5*Math.cos(elapsed / 20.0 + 2.5*letter.index)
		s.alpha = alpha
		s2.alpha = 1-alpha
	}
}

export default diktatApp
