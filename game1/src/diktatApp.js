import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import diktatData from "../assets/diktat-data.yaml"
import { TextButton } from './button'

var currentCursorIndex = 1
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

function generateText(text) {
    const richText = new HTMLText(text, STYLES.words)
    richText.x = 0
    richText.y = 0
    richText.anchor.set(0.5, 0.5)
    return richText
}

function pickRandomWord(database) {
    let selectedWord = database.data.slova[Math.floor(Math.random() * database.data.slova.length)]
    return selectedWord.slovo
}


let gameScreen = new PIXI.Container();
gameScreen.position.set(window.innerWidth/2, window.innerHeight/2)
//gameScreen.width = window.innerWidth
//gameScreen.height = window.innerHeight
diktatApp.stage.addChild(gameScreen)

let textContainer = new PIXI.Container();
textContainer.position.set(window.innerWidth/2, window.innerHeight*0.3)
//textContainer.width = window.innerWidth/2
//textContainer.height = window.innerHeight/2
diktatApp.stage.addChild(textContainer)

let buttonHeight=40

let iButton = new TextButton("i",
    100, buttonHeight,
    -60, 50)

let yButton = new TextButton("y",
    100, buttonHeight,
    +60, 50)

//gameScreen.addChild(button1)
gameScreen.addChild(iButton)
gameScreen.addChild(yButton)

//textButton.on('mousedown', showNewText);
//iButton.on('mousedown', showText)
//yButton.on('mousedown', showText)
//textButton.on('touchstart', onDown);
//iButton.on('touchstart', showText)

showNewText()


function showNewText () {
    const wordList = []
    while (wordList.length < 20) {
        let word = pickRandomWord(diktatData)
        if (!wordList.includes(word)) {
            wordList.push(word)
        }
    }

    // Task: highlight only current cursor (single letter)
    // first construct challenge list, then format it
    //wordList.push("ps[iy]");
		wordListChallenge=[];
    wordList.forEach((element, index) => {
			  let e=element;
				e=e.replace(/\[iy\]/g, KTOREKOLVEK_IY_KRATKE);
				e=e.replace(/\[íý\]/g, KTOREKOLVEK_IY_DLHE);
        wordListChallenge.push(e)
    });

    currentCursorIndex = 1
    showText()
}

function highlightCursor(wordListVec, cursorSymbol, index) {
    const highlighted =
        wordListVec.substring(0, index) +
        "<span>" + cursorSymbol + "</span>" +
        wordListVec.substring(index + 1);
    return highlighted
}

function nextCursorPosition(wordListVec, cursorSymbol, index) {
    console.log("wordListVec: " + wordListVec)
    console.log("cursorSymbol: " + cursorSymbol)
    console.log("index: " + index)
    const nextPos = wordListVec.split(
        cursorSymbol, index).join(cursorSymbol).length
    console.log("NextPos: " + nextPos)
    return(nextPos)
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
	        feature1: true,
	        feature2: false,
					char: char,
					is_wildcard: is_wildcard,
					is_long: is_long,
					index: index,
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
	})
}

function animateTextContainer()
{
	let max_frames=50
	if (elapsed>max_frames)
	{
		let scale=1
		textContainer.scale.set(scale,scale)
		return // koniec animacie
	}
	let scale=1-(max_frames-elapsed)/max_frames*0.1*Math.cos(elapsed / 3.0)
	textContainer.scale.set(scale,scale)
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
	let angle=10*Math.cos(elapsed / 13.0+letter.index)
	s.angle = angle
	s2.angle = angle
	// viditelnost medzi sprite a sprite2
	let alpha = 0.5+0.5*Math.cos(elapsed / 20.0 + 3*letter.index)
	s.alpha = alpha
	s2.alpha = 1-alpha
}

export default diktatApp
