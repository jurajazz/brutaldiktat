
import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import { TextButton } from './button'

import * as TEXT from './text'
import * as CURSOR from './animation/cursor'
import * as LETTER from './animation/letter'
import * as PHASES from './phases.js'
import * as CONNECT from './libs/connect'

// list of letters
var letters = [] // list of objects LETTER.Letter
var elapsed=0 // total elapsed time for animations

var application=null; // napriklad diktatApp
var introScreen;
var textContainer;
var cursor_graphics = null // object of CURSOR.Cursor
var screen_width = 0
var screen_height = 0
var horizontal_mode = false

var currentCursorIndex = 0
var cursor_graphics = null // object of CURSOR.Cursor

var ticker = false // true ak uz je antivni

export function initialize(app)
{
	application = app

	introScreen = new PIXI.Container();
	application.stage.addChild(introScreen)
}

export function windowSizeChanged(w,h,horizontal)
{
	horizontal_mode = horizontal
	screen_width = w
	screen_height = h
	console.log("screen_intro.windowSizeChanged: " + screen_width + "," + screen_height);
}

export function showScreen()
{
	introScreen.position.set(screen_width/2, screen_height/2)
	showBackground()
	var fontsize_big = screen_height*0.2
	var fontsize_small = screen_height*0.1
	let ypos_big = -screen_height*0.5+screen_height*0.2
	let ypos_small = ypos_big+fontsize_big*1.5
	var text_big = 'Diktátik'
	var text_small = 'Vyskúšajte, aké je písanie'
	if (!horizontal_mode)
	{
		// vertical mode - 2 lines text
		ypos_big = -screen_height*0.5+screen_height*0.1
		ypos_small = ypos_big+fontsize_big*1.5
		fontsize_big /= 2
		fontsize_small /= 2
		text_small = 'Vyskúšajte,\naké je písanie'
	}
	const label1 = new PIXI.Text(text_big,
	{ fontFamily : STYLES.fontFamily,
		fontSize: fontsize_big,
		fill : STYLES.bigFontColor,
		align : 'center'})
	label1.y = ypos_big
	label1.x = -label1.width/2 // center
	introScreen.addChild(label1);

	var pravopis=text_small
	var label2 = new PIXI.Text(pravopis,
	{ fontFamily : STYLES.fontFamily,
		fontSize: fontsize_small,
		fill : STYLES.bigFontColor,
		align : 'center'})
	label2.y = ypos_small
	label2.x = -label2.width/2 // center
	introScreen.addChild(label2);

	showButtons()
}

export let buttonWithYpsilon = null
export let buttonWithoutYpsilon = null

function showButtons()
{
	var text_s_y = "s ypsilonom"
	var text_bez_y = "bez neho"
	var buttons_count=2
	var fontsize = screen_height*0.07
	if (horizontal_mode)
	{
		let buttonHeight=screen_height*0.45*0.45
		let y = 1.5*buttonHeight
		let buttonWidth = screen_width*1/(buttons_count+1)
		buttonWithYpsilon = new TextButton(text_s_y,
		    buttonWidth, buttonHeight,
		    -buttonWidth*0.9, y, fontsize)
		buttonWithoutYpsilon = new TextButton(text_bez_y,
		    buttonWidth, buttonHeight,
		    +buttonWidth*0.9, y, fontsize)
	}
	else
	{
		let buttonHeight=screen_height*0.45/(buttons_count+1)
		let y = buttonHeight+0.33*buttonHeight
		let buttonWidth = screen_width*0.8
		buttonWithYpsilon = new TextButton(text_s_y,
		    buttonWidth, buttonHeight,
		    0, y, fontsize)
		buttonWithoutYpsilon = new TextButton(text_bez_y,
		    buttonWidth, buttonHeight,
		    0, y+buttonHeight+0.33*buttonHeight, fontsize)
	}
	// kim nie je zo servera odpoved, alebo timeout - ziadne tlacitka sa nezobrazia
	// zobrazia sa az po odpovedi zo serveru alebo timeoute
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
			var x = (i/max_x_letters) * screen_width - screen_width/2
			var y = (j/max_y_letters) * screen_height - screen_height/2
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
var timeout_for_server_response_ticks = 5000
var buttons_shown = false
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
			if (!buttons_shown && PHASES.is(PHASES.PHASE_INTRO_SCREEN))
			{
				if (elapsed*application.ticker.deltaMS > timeout_for_server_response_ticks) ShowButtons("Timeout waiting for connection.")
				if (CONNECT.is_user_profile_received()) ShowButtons("User profile received")
			}
			buttonWithYpsilon.animate(elapsed)
			buttonWithoutYpsilon.animate(elapsed)
	})
	ticker=true
}

function ShowButtons(reason)
{
	console.log('Show Buttons: '+reason)
	buttons_shown = true
	introScreen.addChild(buttonWithYpsilon)
	introScreen.addChild(buttonWithoutYpsilon)
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
