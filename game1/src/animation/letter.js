import * as PIXI from 'pixi.js'
import * as STYLES from '../styles'
import * as TEXT from '../text'

var render_enabled = true

export function enableRender()
{
	render_enabled = true
}
export function disableRender()
{
	render_enabled = false
}

var use_squares=0 // zobrazuje stvorce namiesto hojdajucich pismen
export function setUseSquares(squares)
{
	use_squares = squares
}
export function getUseSquares(squares)
{
	return use_squares
}

export class Letter
{
	constructor(char,char_alternative,color,is_wildcard,is_long,index,should_be_ypsilon,can_be_any_iy,size)
	{
		this.structure = {
			sprite: null,
			sprite2: null,
			square: null,
			char: char,
			x: 0,
			y: 0,
			answer: char,
			is_wildcard: is_wildcard,
			is_long: is_long,
			index: index,
			is_selected: false,          // true ak uzivatel zvolil nejake pismeno i/y
			is_selection_ypsilon: false,
			should_be_ypsilon: should_be_ypsilon,
			can_be_any_iy: can_be_any_iy,
			is_correct: false, // true ak je visledok spravni
			mark: null, // graficki simbol pre zobrazenie ne/spravnosti (is_correct)
			alpha_max: 1, // maximalna alpha
			alpha_max_selected: 1
		}
		if (render_enabled)
		{
			if (is_wildcard && use_squares)
			{
				// stvorec namiesto pismena
				var square_size = size*0.5
				var line_size = size*0.07
				this.structure.square = new PIXI.Graphics()
				var box=this.structure.square;
				box.beginFill(STYLES.colorWildCardLetter,0.3);
				//box.lineStyle(line_size, STYLES.colorWildCardLetter,0.1);
				box.drawRoundedRect(0, 0, square_size*0.5, square_size, line_size);
				box.endFill();
			}
			this.structure.sprite = new PIXI.Text(char,
			{
				fontFamily : STYLES.fontFamily,
				fontSize: size,
				fill : color,
				align : 'center'
			})
			this.structure.sprite2 = new PIXI.Text(char_alternative,
			{
				fontFamily : STYLES.fontFamily,
				fontSize: size,
				fill : color,
				align : 'center'
			})
		}
	}
	setSelected(set_selected_ypsilon)
	{
		this.structure.is_selected = true;
		this.structure.is_selection_ypsilon = set_selected_ypsilon;
	}
	setAlphaMax(alpha)
	{
		this.structure.alpha_max = alpha
	}
	setAlphaMaxSelected(alpha)
	{
		this.structure.alpha_max_selected = alpha
	}
	getStructure()
	{
		return this.structure
	}
	getWidth()
	{
		if (!render_enabled) return 0
		return this.structure.sprite.width
	}
	getHeight()
	{
		if (!render_enabled) return 0
		return this.structure.sprite.height
	}
	animate(elapsed)
	{
		var letter = this.structure
		if (!letter.is_wildcard) return;
		let s=letter.sprite
		let s2=letter.sprite2
		let sq=letter.square
		if (letter.is_selected)
		{
			s.alpha = 0
			s2.alpha = 0
			s.angle = 0
			s2.angle = 0
			if (letter.is_selection_ypsilon)
				s.alpha = letter.alpha_max_selected
			else
				s2.alpha = letter.alpha_max_selected
			if (use_squares && letter.square)
				letter.square.alpha = 0
		}
		else
		{
			let angle=10*Math.cos(elapsed / 13.0+letter.index)
			s.angle = angle
			s2.angle = angle
			if (use_squares)
			{
				if (sq)
				{
					sq.alpha = letter.alpha_max_selected
					sq.angle = angle
				}
				s.alpha = 0
				s2.alpha = 0
			}
			else
			{
				// viditelnost medzi sprite a sprite2
				if (TEXT.is_new_orthography)
				{
					s.alpha = 0
					s2.alpha = letter.alpha_max
				}
				else
				{
					let alpha = letter.alpha_max*(0.5+0.5*Math.cos(elapsed / 20.0 + 2.5*letter.index))
					s.alpha = alpha
					s2.alpha = letter.alpha_max-alpha
				}
			}
		}
	}
	animateMark(elapsed)
	{
		if (!render_enabled) return
		var mark = this.structure.mark
		if (!mark) return;
		let alpha = 0.4+0.1*Math.cos(elapsed / 10.0)
		if (!this.structure.is_correct)
		{
			var s=mark.box
			s.alpha = alpha
			//s.scale.set(alpha)
		}
	}
	getChar()
	{
		return this.structure.char
	}
	getPositionX()
	{
		return this.structure.x
	}
	getPositionY()
	{
		return this.structure.y
	}
	setPosition(x,y)
	{
		this.structure.x = x
		this.structure.y = y
		if (!render_enabled) return
		var s=this.structure.sprite
		var s2=this.structure.sprite2
		let sq = this.structure.square
		s.x = x;
		s2.x = x;
		s.y = y;
		s2.y = y;
		s2.alpha = 0; // neviditelna alternativa
		if (sq)
		{
			sq.x = x;
			sq.y = y;
		}
	}
	initPosition()
	{
		if (!render_enabled) return
		// fine tune initial position
		var letter = this.structure
		if (!letter.is_wildcard) return
		let s = letter.sprite
		let s2 = letter.sprite2
		let sq = letter.square
		if (sq)
		{
			sq.pivot.set(s.width*0.3,s.height*0.3);
			sq.x+=s.width*0.5;
			sq.y+=s.height*0.7;
		}
		//let s=letter.sprite;
		s.pivot.set(s.width/2,s.height/2);
		s.x+=s.width/2;
		s.y+=s.height/2;
		s.scale.set(0.9,0.9);
		s2.pivot.set(s.width/2,s.height/2);
		s2.x+=s.width*0.8;
		s2.y+=s.height/2;
	}
}
