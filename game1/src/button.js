import * as PIXI from 'pixi.js'
import * as STYLES from './styles'

export class TextButton extends PIXI.Container {
    constructor(text, w, h, x, y) {
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
        this.addChild(this.button)
	  this.setText(text)
        this.interactive = true;
    }
	setText(text)
	{
		if (this.buttonText) this.removeChild(this.buttonText)
		this.buttonText= new PIXI.Text(
		text,
		STYLES.buttonText)
		this.addChild(this.buttonText)
		this.buttonText.anchor.set(0.5, 0.5)
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
