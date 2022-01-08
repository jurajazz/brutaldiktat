import * as PIXI from 'pixi.js'

export class Cursor
{
	constructor()
	{
		this.box = new PIXI.Graphics()
		this.basex = 0
		this.basey = 0
		this.sourcex = 0
		this.sourcey = 0
		this.targetx = 0
		this.targety = 0
		this.phase = 0   // 0-1 where transition from source to target
		this.scale = 1

		var box=this.box;
		box.beginFill(0xf0c020);
		box.lineStyle(3, 0xffff00, 5);
		box.drawRoundedRect(0, 0, 50, 30, 10);
		box.endFill();
		box.alpha = 0.5
	}
	getBox()
	{
		return this.box
	}
	hide()
	{
		this.box.alpha=0
	}
	setSize(scale)
	{
		this.scale = scale
	}
	startMove(targetx,targety)
	{
		this.targetx = targetx
		this.targety = targety
		this.sourcex = this.basex
		this.sourcey = this.basey
		this.phase = 0
	}
	animate(elapsed)
	{
		var box = this.box

		if (this.phase<1)
		{
			// posun kurzor na novu poziciu targetx,targety pocas phase 0-1
			this.basex = this.sourcex + (this.targetx-this.sourcex)*this.phase
			this.basey = this.sourcey + (this.targety-this.sourcey)*this.phase
			this.phase += 0.1
		}

		var size = this.scale*30+this.scale*5*Math.cos(elapsed / 10.0)
		box.x = this.basex-size/2
		box.y = this.basey-size/2
		box.width = size
		box.height = size
	}
}
