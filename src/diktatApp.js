import * as PIXI from 'pixi.js'
import { HTMLText } from '@pixi/text-html';

import * as STYLES from './styles'
import "./styles.css"
import brutalSampleImg from "../assets/brutal-sample-595x417.png"
import diktatData from "../assets/diktat-data.yaml"
import { TextButton, Button } from './button'

var currentCursorIndex = 1
var wordListJoined = ""
const wordListChallenge = []

// Create the application helper and add its render target to the page
let diktatApp = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50,
    forceCanvas: true
});

function addMovingImage(app) {
    let sprite = PIXI.Sprite.from(brutalSampleImg)
    sprite.scale.set(0.3, 0.3)
    sprite.y = 500

    app.stage.addChild(sprite)

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0
    app.ticker.add((delta) => {
        elapsed += delta / 2
        sprite.x = 320.0 + Math.cos(elapsed / 50.0) * 320.0
    })
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
gameScreen.position.set(500, 500)
gameScreen.width = 1000
gameScreen.height = 500
diktatApp.stage.addChild(gameScreen)


let textContainer = new PIXI.Container();
textContainer.width = 1000
textContainer.height = 1000
gameScreen.addChild(textContainer)

addMovingImage(diktatApp)

let textButton = new TextButton("ok",
    100,
    40,
    400,
    300)
let iButton = new TextButton("i/í",
    100,
    40,
    480,
    250)

let yButton = new TextButton("y/ý",
    100,
    40,
    375,
    250)

textButton.on('mousedown', onDown);
textButton.on('touchstart', onDown);
iButton.on('mousedown', moveCursorNext)
iButton.on('touchstart', moveCursorNext)

function onDown(eventData) {
    const wordList = []
    while (wordList.length < 10) {
        let word = pickRandomWord(diktatData)
        if (!wordList.includes(word)) {
            wordList.push(word)
        }
    }

    // Task: highlight only current cursor (single letter)
    // first construct challenge list, then format it
    wordList.push("ps[iy]")
    wordList.forEach((element, index) => {
        wordListChallenge.push(element.replace(/\[iy\]|\[yi\]|y|ý|i|í/gi, '_'))
    });

    currentCursorIndex = 1
    moveCursorNext()
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

function moveCursorNext() {
    textContainer.removeChildren()
    wordListJoined = wordListChallenge.join(', ')
    textContainer.addChild(generateText(generateWordList(wordListJoined)))

}
function generateWordList(list) {
    const nextCursorPos = nextCursorPosition(list, '_', currentCursorIndex)
    currentCursorIndex = currentCursorIndex + 1
    console.log("currentCursorIndex: " + currentCursorIndex + ", nextCursorPos: " + nextCursorPos)
    const blinkerStyle =
        `<style>
        span {
            color:#ccff66;
        }
        .current_cursor{
            color:#ff809f
        }
    </style>
    `
    return blinkerStyle + highlightCursor(list, '_', nextCursorPos)
}

gameScreen.addChild(textButton);
gameScreen.addChild(iButton)
gameScreen.addChild(yButton)

export default diktatApp