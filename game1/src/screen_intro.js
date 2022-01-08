
import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import { TextButton } from './button'

import * as TEXT from './text'
import * as CURSOR from './animation/cursor'
import * as LETTER from './animation/letter'
import * as PHASES from './phases.js'

// list of letters
var letters = [] // list of objects LETTER.Letter
var elapsed=0 // total elapsed time for animations

var application=null; // napriklad diktatApp
var introScreen;
var textContainer;
var cursor_graphics = null // object of CURSOR.Cursor

var currentCursorIndex = 0
var cursor_graphics = null // object of CURSOR.Cursor

var ticker = false // true ak uz je antivni

export function initialize(app)
{
	application = app

	introScreen = new PIXI.Container();
	introScreen.position.set(window.innerWidth/2, window.innerHeight/2)
	application.stage.addChild(introScreen)
}

export function showScreen()
{
	showBackground()
	let y = -100 //-window.innerHeight/2 + 100
	const label1 = new PIXI.Text('Brutál Diktát',
	{ fontFamily : STYLES.fontFamily,
		fontSize: 80,
		fill : 0x000000,
		align : 'center'})
	label1.y = y
	label1.x = -label1.width/2 // center
	introScreen.addChild(label1);

	var pravopis='Vyskúšajte, aké je písanie'
	var label2 = new PIXI.Text(pravopis,
	{ fontFamily : STYLES.fontFamily,
		fontSize: 30,
		fill : 0x000000,
		align : 'center'})
	label2.y = y+100
	label2.x = -label2.width/2 // center
	introScreen.addChild(label2);

	showButtons()
}

export let buttonWithYpsilon = null
export let buttonWithoutYpsilon = null

function showButtons()
{
	let buttonHeight=60
	let y = 1.5*buttonHeight
	buttonWithYpsilon = new TextButton("s ypsilonom",
	    400, buttonHeight,
	    0, y)
	introScreen.addChild(buttonWithYpsilon)
	buttonWithoutYpsilon = new TextButton("alebo bez neho",
	    400, buttonHeight,
	    0, y+buttonHeight*1.2)
	introScreen.addChild(buttonWithoutYpsilon)
}

var letters=[]
function showBackground()
{
	var color = STYLES.colorWildCardLetter
	var is_wildcard = true
	var size = 80
	var max_x_letters = 10
	var max_y_letters = 10
	for (let i = 0; i < max_x_letters; i++)
	{
		for (let j = 0; j < max_y_letters; j++)
		{
			let letter = new LETTER.Letter('y','i',color,is_wildcard,false,i+j,false,false,size);
			letter.setAlphaMax(0.15)
			letter.setAlphaMaxSelected(0.3)
			//var x = Math.random() * window.innerWidth - window.innerWidth/2
			//var y = Math.random() * window.innerHeight - window.innerHeight/2
			var x = (i/max_x_letters) * window.innerWidth - window.innerWidth/2
			var y = (j/max_y_letters) * window.innerHeight - window.innerHeight/2
			letter.setPosition(x,y)
			introScreen.addChild(letter.getStructure().sprite);
			introScreen.addChild(letter.getStructure().sprite2);
			// nastav polohu nedefinovanich pismen
			letter.initPosition()
			letters.push(letter)
		}
	}
	showCursor()
	addAnimations()
}
function showCursor()
{
	cursor_graphics = new CURSOR.Cursor()
	cursor_graphics.setSize(2.5)
	introScreen.addChild(cursor_graphics.getBox())
}

var elapsed=0
var ticker = false
function addAnimations()
{
	if (ticker) return
	application.ticker.add((delta) => {
			elapsed += delta;
			// pohibuj so zatial nedefinovanimi pismenami
			letters.forEach(animateLetter);
			if (cursor_graphics) cursor_graphics.animate(elapsed)
			//if (PHASES.PHASE_SHOWING_RESULTS == PHASES.phase) letters.forEach(animateMark);
			animateCursor(elapsed)
	})
	ticker=true
}

function animateLetter(letter) { letter.animate(elapsed) }
function animateMark(letter) {letter.animateMark(elapsed) }
var last_cursor_time=0
var last_cursor_letter_id=0
var last_cursor_defined=false
function animateCursor(elapsed)
{
	const cursor_switch_period = 50
	if (elapsed-last_cursor_time < cursor_switch_period) return
	if (last_cursor_defined)
	{
		var is_ypsilon = false
		if (Math.random()<0.5) is_ypsilon = true
		letters[last_cursor_letter_id].setSelected(is_ypsilon)
	}
	last_cursor_defined = true
	last_cursor_time = elapsed
	last_cursor_letter_id = Math.floor(Math.random()*letters.length)
	var s = letters[last_cursor_letter_id].getStructure().sprite
	cursor_graphics.startMove(s.x,s.y)
}

export function hide()
{
	introScreen.removeChildren()
}
