import * as PIXI from 'pixi.js'
import * as STYLES from './styles'

export class TextButton extends PIXI.Container {
    constructor(text, w, h, x, y, fontsize) {
        super()
        this.width = w;
        this.height = h
        this.position.set(x, y);

        this.button = new Button(
            PIXI.Texture.WHITE,
            w,
            h,
            0,
            0)
        this.button.anchor.set(0.5, 0.5)
        this.interactive = true
        this.fontsize = fontsize
        this.addChild(this.button)
        this.setText(text)
    }
    setTextColor(color)
    {
	  this.buttonText.style.color = color
    }
    setBackgroundColor(color)
    {
	    this.button.tint = color
    }
    setText(text) {
        if (this.buttonText) this.removeChild(this.buttonText)
        this.buttonText = new PIXI.Text(
            text,
            {fontFamily: STYLES.fontFamily,
            fontSize: this.fontsize,
            fontWeight: "bold",
            //fontStyle: 'italic',
            fill: 0xffffff,
            //stroke: '#66A0CC',
            //strokeThickness: 1,
            align: 'center'})
        this.addChild(this.buttonText)
	  this.alpha = 1
        this.buttonText.anchor.set(0.5, 0.5)
    }
    addEventListeners(eventListStr, targetCallback) {
        eventListStr.forEach(function (item, index) {
            this.on(item, targetCallback)
          }, this);
    }
    animate(elapsed)
    {
        let angle=0.05*Math.cos(elapsed / 13.0)
        this.rotation = angle
        let scale=1+0.03*Math.cos(elapsed / 10.0)
        this.scale.set(scale,scale)
    }
    animate_with_alpha(elapsed,alpha_min,alpha_max)
    {
        this.animate(elapsed)
        let alpha=alpha_min+(alpha_max-alpha_min)*(0.5+0.5*(Math.cos(elapsed / 40.0)))
        this.alpha = alpha        
    }
}

export class Button extends PIXI.Sprite {
    constructor(texture, w, h, x, y) {
        super(texture);
        this.buttonMode = true;
        this.width = w;
        this.height = h;
        this.tint = STYLES.buttonBackGround;
        this.position.set(x, y);
        this.interactive = true;
        this.anchor.set(0.5);
    }
}



export default Button
