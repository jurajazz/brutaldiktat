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

export class Letter
{
	constructor(char,char_alternative,color,is_wildcard,is_long,index,should_be_ypsilon,can_be_any_iy,size)
	{
		this.structure = {
			sprite: null,
			sprite2: null,
			char: char,
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
		}
		else
		{
			let angle=10*Math.cos(elapsed / 13.0+letter.index)
			s.angle = angle
			s2.angle = angle
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
	setPosition(x,y)
	{
		if (!render_enabled) return
		var s=this.structure.sprite
		var s2=this.structure.sprite2
		s.x = x;
		s2.x = x;
		s.y = y;
		s2.y = y;
		s2.alpha = 0; // neviditelna alternativa
	}
	initPosition()
	{
		if (!render_enabled) return
		// fine tune initial position
		var letter = this.structure
		if (!letter.is_wildcard) return
		let s = letter.sprite
		//let s=letter.sprite;
		s.pivot.set(s.width/2,s.height/2);
		s.x+=s.width/2;
		s.y+=s.height/2;
		s.scale.set(0.9,0.9);
		s = letter.sprite2
		s.pivot.set(s.width/2,s.height/2);
		s.x+=s.width*1;
		s.y+=s.height/2;
	}
}
