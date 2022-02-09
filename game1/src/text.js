import diktatData from "../assets/diktat-data.yaml"
import * as PIXI from 'pixi.js'
import * as LETTER from './animation/letter'
import * as STYLES from './styles'

export const KTOREKOLVEK_IY_KRATKE = 'ǒ'
export const KTOREKOLVEK_IY_DLHE = 'Ǒ'
export const TESTING_FILL_ALL_I = false

export var is_new_orthography = false
var cacheLetterWidths = {}
var cached_font_size = 100

export function setNewOrthography(is_new)
{
	is_new_orthography = is_new
}

function pickRandomWord()
{
	let selectedWord = diktatData.data.slova[Math.floor(Math.random() * diktatData.data.slova.length)]
	return selectedWord.slovo
}

function pickRandomSentence()
{
	return diktatData.data.veti[Math.floor(Math.random() * diktatData.data.veti.length)]['veta']
}

export function generateNewText(user_profile)
{
	// generovanie zoznamu slov
	const wordList = []
	let selectedSentence = pickRandomSentence()
	console.log("veta"+selectedSentence)
	wordList.push(selectedSentence)
	if (0)
	{
		while (wordList.length < 5)
		{
			let word = pickRandomWord()
			if (!wordList.includes(word)) wordList.push(word)
		}
	}
	var wordListChallenge=[];
	wordList.forEach(
		(element, index) =>
		{
			let e=element;
			e=e.replace(/\[iy\]/g, KTOREKOLVEK_IY_KRATKE);
			e=e.replace(/\[íý\]/g, KTOREKOLVEK_IY_DLHE);
			wordListChallenge.push(e)
		}
	)

  return wordListChallenge
}

export function cacheAllLettersWidths(font_size)
{
	cached_font_size = font_size
	var dstart = performance.now()
	//console.log("Caching letters")
	let chars = ' AÁÄBCČDĎDzDžEÉFGHChIÍJKLĹĽMNŇOÓÔPQRŔSŠTŤUÚVWXYÝZŽaáäbcčdďdzdžeéfghchiíjklĺľmnňoóôpqrŕsštťuúvwxyýzž,.()'
	for (var i = 0; i < chars.length; i++)
	{
		var char = chars[i]
		let letter_object = new PIXI.Text(char,
		{
			fontFamily : STYLES.fontFamily,
			fontSize: font_size,
		})
		let width = letter_object.width
		cacheLetterWidths[char] = width
		//console.log("Char:"+char+" width:",width)
	}
	var dend = performance.now()
	//console.log("Caching EndTime:"+(dend-dstart)+"ms")
}

export function placeLetters(wordListJoined,letters,textContainer,font_size)
{
	let line_size_y=font_size*1.3
	let leftx=-textContainer.width*0.45
	let rightx=textContainer.width*0.45
	let bottomy=textContainer.height*0.45
	let basex=leftx
	let basey=-textContainer.position.y/2
	let index=0;
	let width_scale=0.9
	for (let i = 0; i < wordListJoined.length; i++)
	{
		var char=wordListJoined[i];
		var char_alternative='i';
		var should_be_ypsilon=false;
		var can_be_any_iy=false;
		var is_wildcard=false;
		var color = 0x606060;
		var is_long=false;
		if (char=='y' || char=='ý') should_be_ypsilon = true;
		if (char=='i' || char=='y' || char==KTOREKOLVEK_IY_KRATKE)
		{
			is_wildcard=true;
			index++;
		}
		if (char=='í' || char=='ý' || char==KTOREKOLVEK_IY_DLHE)
		{
			is_wildcard=true;
			is_long=true;
			char_alternative='í';
		}
		if (char==KTOREKOLVEK_IY_KRATKE || char==KTOREKOLVEK_IY_DLHE) can_be_any_iy = true;
		if (is_wildcard)
		{
			color = STYLES.colorWildCardLetter
			char='y';
			if (is_long) char='ý';
		}
		let letter_object = new LETTER.Letter(char,char_alternative,color,is_wildcard,is_long,index,should_be_ypsilon,can_be_any_iy,font_size);
		//letter_object.spos(basex,basey)
		//console.log("Letter: basex:"+basex+"basey:"+basey+" font_size:"+font_size)
		letter_object.setPosition(basex,basey)
		letters.push(letter_object)
		// generuj poziciu dalsieho pismena
		basex += getLetterOrCachedWidth(letter_object,font_size)*width_scale
		if (basex>rightx)
		{
			// prechod na novi riadok
			// hladaj poslednu medzeru
			let pocetPismenNaPresun=0;
			let id=i;
			while (letters[id].getStructure().char!=' ')
			{
				id--;
				pocetPismenNaPresun++;
				if (id==0) break; // ak bi tam nahodou nebola
			}
			if (pocetPismenNaPresun>0) id++;
			// posun slovo z predchadzajuceho riadku na novi riadok
			basex=leftx;
			basey+=line_size_y;
			for (let j=0;j<pocetPismenNaPresun;j++)
			{
				//console.log("Presun pismeno "+letters[id+j].char);
				let l=letters[id+j]
				l.setPosition(basex,basey)
				basex+=getLetterOrCachedWidth(l,font_size)*width_scale;
			}
			//console.log("Line check: basey:"+basey+" bottomy:"+bottomy+" font_size:"+font_size)
			if (basey>bottomy)
			{
				return false // nepodarilo sa vsetki pismena ulozit
			}
		}
	}
	return true // podarilo sa vsetki pismena ulozit
}

function getLetterOrCachedWidth(letter_object,font_size)
{
	var letter_width = letter_object.getWidth()
	//console.log("Letter width:",char," width:",letter_width)
	//if (letter_width == 0)
	{
		var char = letter_object.structure.char
		letter_width = cacheLetterWidths[char]
		letter_width *= font_size/cached_font_size
		//console.log("Letter cached width:",char," width:",letter_width)
	}
	return letter_width
}
