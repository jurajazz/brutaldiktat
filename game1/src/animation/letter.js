import * as PIXI from 'pixi.js'
import * as STYLES from '../styles'
import * as TEXT from '../text'

export class Letter
{
	constructor(char,char_alternative,color,is_wildcard,is_long,index,should_be_ypsilon,can_be_any_iy)
	{
		this.structure = {
			sprite: new PIXI.Text(char,
			{
				fontFamily : STYLES.fontFamily,
				fontSize: 24,
				fill : color,
				align : 'center'
			}),
			sprite2: new PIXI.Text(char_alternative,
			{
				fontFamily : STYLES.fontFamily,
				fontSize: 24,
				fill : color,
				align : 'center'
			}),
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
		}
	}
	getStructure()
	{
		return this.structure
	}
	getWidth()
	{
		return this.structure.sprite.width
	}
	getHeight()
	{
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
				s.alpha = 1
			else
				s2.alpha = 1
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
				s2.alpha = 1
			}
			else
			{
				let alpha = 0.5+0.5*Math.cos(elapsed / 20.0 + 2.5*letter.index)
				s.alpha = alpha
				s2.alpha = 1-alpha
			}
		}
	}
	animateMark(elapsed)
	{
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
