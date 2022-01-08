
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
var gameScreen;
var textContainer;

var currentCursorIndex = 0
var cursor_graphics = null // object of CURSOR.Cursor

var ticker = false // true ak uz je antivni

export function initialize(app)
{
	application = app

	gameScreen = new PIXI.Container();
	gameScreen.position.set(window.innerWidth/2, window.innerHeight/2)
	application.stage.addChild(gameScreen)
}

export function showScreen()
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

	var pravopis='Vyhodnotenie'
	var label2 = new PIXI.Text(pravopis,
	{ fontFamily : STYLES.fontFamily,
		fontSize: 30,
		fill : 0x000000,
		align : 'center'})
	label2.y = y+100
	label2.x = -label2.width/2 // center
	gameScreen.addChild(label2);
}
