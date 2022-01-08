import diktatData from "../assets/diktat-data.yaml"

export const KTOREKOLVEK_IY_KRATKE = 'ǒ'
export const KTOREKOLVEK_IY_DLHE = 'Ǒ'
export const TESTING_FILL_ALL_I = false

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
