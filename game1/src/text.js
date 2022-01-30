import diktatData from "../assets/diktat-data.yaml"
import * as LETTER from './animation/letter'
import * as STYLES from './styles'

export const KTOREKOLVEK_IY_KRATKE = 'ǒ'
export const KTOREKOLVEK_IY_DLHE = 'Ǒ'
export const TESTING_FILL_ALL_I = false

export var is_new_orthography = false

export function setNewOrthography(is_new)
{
	is_new_orthography = is_new
}

function pickRandomWord(database) {
	let selectedWord = database.data.slova[Math.floor(Math.random() * database.data.slova.length)]
	return selectedWord.slovo
}

export function generateNewText ()
{
	// generovanie zoznamu slov
	const wordList = []
	while (wordList.length < 20)
	{
		let word = pickRandomWord(diktatData)
		if (!wordList.includes(word)) wordList.push(word)
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

export function placeLetters(letters,textContainer,font_size)
{
	var wordListChallenge = generateNewText()
	var wordListJoined = wordListChallenge.join(', ')

	let line_size_y=font_size*1.3
	let leftx=-textContainer.width*0.45
	let rightx=textContainer.width*0.45
	let bottomy=textContainer.height*0.45
	let basex=leftx
	let basey=-textContainer.position.y/2
	let index=0;
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
		basex += letter_object.getWidth()
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
				basex+=l.getWidth();
			}
			//console.log("Line check: basey:"+basey+" bottomy:"+bottomy+" font_size:"+font_size)
			if (basey>bottomy) return false // nepodarilo sa vsetki pismena ulozit
		}
	}
	return true // podarilo sa vsetki pismena ulozit
}
