import * as PIXI from 'pixi.js'
import * as STYLES from '../styles'

// ispired by https://codepen.io/jasonsturges/pen/XWdbKBy
export class Star
{
	constructor()
	{
		this.x = 0
		this.y = 0
	}
	draw(target, x, y, points, innerRadius, outerRadius, angle = 0)
	{
		if (points < 3) return
		let step, halfStep, start, n, dx, dy;
		step = (Math.PI * 2) / points;
		halfStep = step / 2;
		start = (angle / 180) * Math.PI;
		target.moveTo(x + (Math.cos(start) * outerRadius), y - (Math.sin(start) * outerRadius));
		for (n = 1; n <= points; ++n)
		{
			dx = x + Math.cos(start + (step * n) - halfStep) * innerRadius;
			dy = y - Math.sin(start + (step * n) - halfStep) * innerRadius;
			target.lineTo(dx, dy);
			dx = x + Math.cos(start + (step * n)) * outerRadius;
			dy = y - Math.sin(start + (step * n)) * outerRadius;
			target.lineTo(dx, dy);
		}
}
