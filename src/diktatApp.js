import * as PIXI from 'pixi.js'
import "./styles.css"
import brutalSampleImg from "../assets/brutal-sample-595x417.png"
import diktatData from "../assets/diktat-data.yaml"

// Create the application helper and add its render target to the page
let diktatApp = new PIXI.Application({ width: 640, height: 640 })

function addMovingImage(app) {
    let sprite = PIXI.Sprite.from(brutalSampleImg)
    sprite.scale.set(0.3, 0.3)
    sprite.y = 500

    app.stage.addChild(sprite)

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0
    app.ticker.add((delta) => {
        elapsed += delta/2
        sprite.x = 320.0 + Math.cos(elapsed / 50.0) * 320.0
    })
}

function addText(app) {
    // Create the sprite and add it to the stage
    const style = new PIXI.TextStyle({
        fontFamily: 'Helvetica',
        fontSize: 36,
        fill: ['#ffffff', '#aaaaaa'], // gradient
        stroke: '#ff9900',
        strokeThickness: 2,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    })

    //obj_keys[Math.floor(Math.random() *obj_keys.length)]
    let selectedWord = diktatData.data.slova[Math.floor(Math.random() * diktatData.data.slova.length)]
    console.log(selectedWord)
    const richText = new PIXI.Text(selectedWord.slovo, style)
    richText.x = 50
    richText.y = 220
    app.stage.addChild(richText)
}

addText(diktatApp)
addMovingImage(diktatApp)

export default diktatApp