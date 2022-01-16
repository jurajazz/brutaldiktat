import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import diktatData from "../assets/diktat-data.yaml"
import * as STYLES from './styles'
import "./styles.css"
import { TextButton } from './button'
import './icko'
import WordListHandler from './wordListHandler'

// Create the application helper and add its render target to the page
let diktatApp = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50,
    forceCanvas: true
});

var wordListHandler

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
gameScreen.position.set(300, 300)
gameScreen.width = 1000
gameScreen.height = 500
diktatApp.stage.addChild(gameScreen)


let textContainer = new PIXI.Container();
textContainer.width = 1000
textContainer.height = 1000
gameScreen.addChild(textContainer)

let newGameButton = new TextButton("Nová hra",
    100,
    40,
    400,
    100)
let iButton = new TextButton("i/í",
    100,
    40,
    375,
    150)

let yButton = new TextButton("y/ý",
    100,
    40,
    480,
    150)

newGameButton.on('mousedown', onDown);
newGameButton.on('touchstart', onDown);
iButton.on('mousedown', addMakkeI)
iButton.on('touchstart', addMakkeI)
yButton.on('mousedown', addTvrdeY)
yButton.on('touchstart', addTvrdeY)

function onDown(eventData) {
    const wordList = []
    while (wordList.length < 10) {
        let word = pickRandomWord(diktatData)
        if (!wordList.includes(word)) {
            wordList.push(word)
        }
    }

    wordListHandler = new WordListHandler(wordList)
    updateCursorPositionOnScreen()
}

function updateCursorPositionOnScreen(makkeI) {
    if (wordListHandler != null) {
        textContainer.removeChildren()
        textContainer.addChild(generateText(wordListHandler.moveCursorRight()))
    }
}

function addMakkeI() {
    wordListHandler.fillLetter(true)
}

function addTvrdeY() {
    wordListHandler.fillLetter(false)
}

gameScreen.addChild(newGameButton);
gameScreen.addChild(iButton)
gameScreen.addChild(yButton)

export default diktatApp