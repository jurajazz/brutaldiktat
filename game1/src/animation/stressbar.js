import * as PIXI from 'pixi.js'
import * as STYLES from '../styles'
import * as PHASES from '../phases.js'
import * as TEXT from '../text.js'

var screen_width = window.innerWidth
var screen_height = window.innerHeight
var horizontal_mode=false
var gameScreen=null

export function set_horizontal_mode(mode)
{
	horizontal_mode=mode
}
export function set_GameScreen(screen)
{
	gameScreen=screen
}

var back_progress
var progress
var progress_container
var progress_label
var progress_ypos=0
var time_available=15 // cas, ktori je k dispozicii na dokoncenie
var time_for_read=1
var stress_start_time = performance.now()
var stress_end_time = performance.now()

export function setTimeAvailable(time)
{
	time_available=time
}

export function addTimeAvailable(time)
{
	time_available+=time
}

export function resetTimeForRead()
{
	time_for_read=0
}

export function addTimeForRead(time)
{
	time_available+=time
	time_for_read+=time
}


export function show() // v pripade prieskumu: progressBar
{
	var sentence_count = TEXT.getSentencesFilledCount()
	var text = ''
	var progress_size_relative = 1
	var progress_color = 0xbbdd77
	if (PHASES.isSimpleSurveyModeActive())
	{
		var start = ''
		switch (sentence_count)
		{
			case 1:
				text += 'veta'
				start = 'Zvládnutá '
				break
			case 2:
			case 3:
			case 4:
				text += 'vety'
				start = 'Zvládnuté '
				break
			default:
				text += 'viet'
				start = 'Zvládnutých '
				break
		}
		text = start+sentence_count+' '+ text + ' zo ' + TEXT.getSentencesTotalCount()
		progress_size_relative = (sentence_count/TEXT.getSentencesTotalCount())
	}
	else
	{
		text = 'Zostáva '+time_available+' s'
		progress_color = 0xe0e0e0
	}
	progress_ypos = -screen_height*0.5 + screen_height*0.12
	var fontsize = screen_height*0.05
	if (!horizontal_mode)
	{
		progress_ypos = -screen_height*0.5 + screen_height*0.17
	}
	progress_label = new PIXI.Text(text,
	{ fontFamily : STYLES.fontFamily,
		fontSize: fontsize,
		fill : STYLES.progressFontColor,
	})
	progress_label.anchor.set(0.5,0)
	progress_label.y = progress_ypos

	paint(progress_color,progress_size_relative)
}

function paint(progress_color,progress_size_relative)
{
	back_progress = new PIXI.Graphics();
	progress_container = new PIXI.Container();
	progress = new PIXI.Graphics();
	back_progress.beginFill(0xffffff);
	//progress.beginFill(0xddbb77); // oranzova

	progress.beginFill(progress_color); // zelena
	var margin_in = screen_width*0.005
	//back_progress.lineStyle(3, 0xffffff, 5);
	if (horizontal_mode)
	{
		var margin_w = screen_width*0.2
		back_progress.drawRoundedRect(
			-screen_width*0.5+margin_w,
			progress_ypos,
			screen_width-margin_w*2,
			screen_height*0.07,
			5);
		progress.drawRoundedRect(
			-screen_width*0.5+margin_w+margin_in,
			progress_ypos+margin_in,
			(screen_width-margin_w*2-margin_in*2)*progress_size_relative,
			screen_height*0.07-margin_in*2,
			5);
	}
	else
	{
		var margin_w = screen_width*0.05
		back_progress.drawRoundedRect(
			-screen_width*0.5+margin_w,
			progress_ypos,
			screen_width-margin_w*2,
			screen_height*0.07,
			10);
		progress.drawRoundedRect(
			-screen_width*0.5+margin_w+margin_in,
			progress_ypos+margin_in,
			(screen_width-margin_w*2-2*margin_in)*progress_size_relative,
			screen_height*0.07-margin_in*2,
			5);
	}
	back_progress.endFill();
	gameScreen.addChild(back_progress);
	progress_container.addChild(progress);
	gameScreen.addChild(progress_container)
	gameScreen.addChild(progress_label);
}

var progress_is_red = false
export function animateStress(elapsed)
{
	var total_ms = 1000*time_available
	if (game_finished)
	{
		var time_elapsed = (stress_end_time - stress_start_time)/1000
		progress_label.text = 'Potrebný čas: '+Number.parseFloat(time_elapsed).toFixed(1)+'s'
		progress_label.alpha = 1
		return
	}
	stress_end_time = performance.now()
	var remaining_ms = total_ms - (stress_end_time - stress_start_time)
	if (remaining_ms > 1000*(time_available-time_for_read) && !TEXT.is_new_orthography)
	{
		var wait_s = remaining_ms - 1000*(time_available-time_for_read)
		progress_label.text = 'Prečítajte si vetu ('+Math.round(wait_s/1000)+')'
		progress_label.alpha = 1
		return
	}
	if (remaining_ms<0) remaining_ms=0
	var relative_time = remaining_ms/(total_ms-1000*time_for_read)
	if (TEXT.is_new_orthography) relative_time = remaining_ms/total_ms
	if (relative_time)
		progress_label.text = 'Zostáva '+Math.round(remaining_ms/1000)+' s'
	else
		progress_label.text = 'Nestihli ste to!'
	if (relative_time < 0.30)
	{
		let alpha1 = 0.5-0.5*Math.cos(3.14*(elapsed / 30))
		progress_label.style.fill = '#FF0000'
		progress_label.alpha = alpha1
		if (!progress_is_red)
		{
			// nakresli cervenou
			paint(0xffcccc,1)
			progress_is_red=true
		}
	}
	if (relative_time < 0.15)
	{
		let alpha2 = 0.5-0.5*Math.cos(3.14*(elapsed / 10))
		progress.alpha = alpha2
	}
	var margin_in = screen_width*0.005
	var margin_w = 0
	var width = screen_width*0.9*relative_time
	if (horizontal_mode)
	{
		margin_w = screen_width*0.15
		width = screen_width*0.6*relative_time
	}
	progress_container.width = width
	progress_container.x = progress_container.width*0.5-screen_width*0.45+margin_in+margin_w
	//progress.width = 15 //100*(remaining_ms/total_ms)
	let max_frames=50
	if (elapsed<max_frames)
	{
		let scaley=1+0.01*Math.cos(elapsed / 20.0)
		let scalex=1+0.01*Math.cos(elapsed / 15.0)
		let alpha1 = 0.5-0.5*Math.cos(3.14*(elapsed / max_frames))
		progress.alpha = alpha1
		back_progress.alpha = alpha1
	}
	let label_frames=100
	if (elapsed<label_frames)
	{
		let alpha1 = 0.5-0.5*Math.cos(3.14*(elapsed / label_frames))
		progress_label.alpha = alpha1
	}
}

export function animateProgress(elapsed)
{
	let max_frames=200
	if (elapsed<max_frames)
	{
		let scaley=1+0.01*Math.cos(elapsed / 20.0)
		let scalex=1+0.01*Math.cos(elapsed / 15.0)
		//back_progress.scale.set(scalex,scaley)
		//progress.scale.set(scalex,scaley)
		let alpha1 = 0.5-0.5*Math.cos(3.14*(elapsed / max_frames))
		progress.alpha = alpha1
		back_progress.alpha = alpha1
	}
	let label_frames=100
	if (elapsed<label_frames)
	{
		let alpha1 = 0.5-0.5*Math.cos(3.14*(elapsed / label_frames))
		progress_label.alpha = alpha1
	}
}

var game_finished=false

export function gameFinishedAllFilled()
{
	game_finished = true
}

export function gameStart()
{
	stress_start_time = performance.now()
	game_finished = false
	progress_is_red = false
}
