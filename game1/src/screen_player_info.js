'use strict';
// Narazil som na problem, ze bi som potreboval od hraca vipitat vek/vzdelanie/prezivku,
//  ale neviem v Javascripte naist nejaki jednoduchi sposob na zobrazenie takehoto formularu. Nenapada Ta nieco?

import * as PIXI from 'pixi.js'
import * as STYLES from './styles'
import { TextInput } from './textInput'
import { TextButton } from './button'


var application = null; // napriklad diktatApp
var gameScreen;
export var textInputArray = []

export function initialize(app)
{
	application = app

	gameScreen = new PIXI.Container();
	gameScreen.position.set(window.innerWidth / 2, window.innerHeight / 2)
	application.stage.addChild(gameScreen)

}

export function showScreen()
{
	let y = -window.innerHeight / 2 + 40
	const label1 = new PIXI.Text('Brutal Diktát',
		{
			fontFamily: STYLES.fontFamily,
			fontSize: 80,
			fill: 0x000000,
			align: 'center'
		})
	label1.y = y
	label1.x = -label1.width / 2 // center
	gameScreen.addChild(label1);

	var playerInfoSprava = 'Info o hráčovi'
	var label2 = new PIXI.Text(playerInfoSprava,
		{
			fontFamily: STYLES.fontFamily,
			fontSize: 30,
			fill: 0x000000,
			align: 'center'
		})
	label2.y = y + 100
	label2.x = -label2.width / 2 // center
	gameScreen.addChild(label2);

	let okButton = new TextButton("OK",
		window.innerWidth * 0.1, window.innerHeight * 0.1,
		0, y + 500)
	okButton.addEventListeners(['mousedown', 'tap'], buttonOkClicked)
	gameScreen.addChild(okButton)

	textInputArray.push(defaultTextInput())
	textInputArray[0].placeholder = 'Prezívka...'
	textInputArray[0].x = -textInputArray[0].width / 2
	textInputArray[0].y = y + 100

	textInputArray.push(defaultTextInput())
	textInputArray[1].placeholder = 'Vzdelanie...'
	textInputArray[1].x = -textInputArray[1].width / 2
	textInputArray[1].y = y + 200

	textInputArray.push(defaultTextInput())
	textInputArray[2].placeholder = 'Približní vek...'
	textInputArray[2].x = -textInputArray[2].width / 2
	textInputArray[2].y = y + 300

	gameScreen.addChild(textInputArray[0])
	gameScreen.addChild(textInputArray[1])
	gameScreen.addChild(textInputArray[2])

}

function buttonOkClicked()
{
	console.log("ok clicked")
	if (textInputArray) {
		console.log(textInputVales(textInputArray))
	} else {
		console.log("TextInputArray not initialized")
	}


}

export function textInputVales(vals)
{
	if (vals) {
		return vals.map(element => element.text)
	}
	return {}
}

function defaultTextInput()
{
	return new TextInput({
		input:
		{
			fontFamily: STYLES.fontFamily,
			fontSize: '36px',
			padding: '12px',
			width: '500px',
			color: '#26272E',
		},
		box:
		{
			default: { fill: 0xE8E9F3, rounded: 12, stroke: { color: 0xCBCEE0, width: 3 } },
			focused: { fill: 0xE1E3EE, rounded: 12, stroke: { color: 0xABAFC6, width: 3 } },
			disabled: { fill: 0xDBDBDB, rounded: 12 }
		}
	})
}