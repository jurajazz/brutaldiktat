import './icko'
import Icko from './icko';

export class WordListHandler {
    constructor(wordListArray) {
        if (!Array.isArray(wordListArray)) {
            throw 'Parameter is not a list!';
        }
        this.blankSymbol = '_'
        this.wordList = wordListArray
        this.currentCursorIndex = 0
        this.wordListChallenge = []
        this.filledLetters = []
        this.errors = 0
        this.icka = this.enumerateIcka(this.wordList) // TODO: extract to a separate helper class
        this.wordList.forEach((element, index) => {
            this.wordListChallenge.push(element.replace(/\[iy\]|\[yi\]|y|ý|i|í/gi, this.blankSymbol))
        });
        this.wordListJoined = this.wordListChallenge.join(', ')
    }

    enumerateIcka(list) {
        const ickoArray = []
        list.forEach(element => {
            for (var i = 0; i < element.length; i++) {
                switch (element[i]) {
                    case 'i':
                        ickoArray.push(new Icko(true, true, true))
                        break
                    case 'I':
                        ickoArray.push(new Icko(false, true, true))
                        break
                    case 'í':
                        ickoArray.push(new Icko(true, false, true))
                        break
                    case 'Í':
                        ickoArray.push(new Icko(false, false, true))
                        break
                    case 'y':
                        ickoArray.push(new Icko(true, true, false))
                        break
                    case 'Y':
                        ickoArray.push(new Icko(false, true, false))
                        break
                    case 'ý':
                        ickoArray.push(new Icko(true, false, false))
                        break
                    case 'Ý':
                        ickoArray.push(new Icko(false, false, false))
                        break
                }
            }
        })
        return ickoArray
    }

    ickoToStr(icko) {
        if (!(icko instanceof Icko)) {
            throw 'parameter must be an instance of Icko.'
        }
        const ickoProps = [icko.male, icko.kratke, icko.makke]
        const isEqual = (fs, sc) => fs.map((aVal, aIndex) => aVal === sc[aIndex]).every((cv) => cv === true)
        if (isEqual(ickoProps, [true, true, true])) {
            return 'i'
        }
        if (isEqual(ickoProps, [false, true, true])) {
            return 'I'
        }
        if (isEqual(ickoProps, [true, false, true])) {
            return 'í'
        }
        if (isEqual(ickoProps, [false, false, true])) {
            return 'Í'
        }
        if (isEqual(ickoProps, [true, true, false])) {
            return 'y'
        }
        if (isEqual(ickoProps, [false, true, false])) {
            return 'Y'
        }
        if (isEqual(ickoProps, [true, false, false])) {
            return 'ý'
        }
        if (isEqual(ickoProps, [false, false, false])) {
            return 'Ý'
        }
    }

    moveCursorRight() {
        const nextCursorPos = this.nextCursorPosition(this.wordListJoined, this.blankSymbol, 1)
        const blinkerStyle =
            `<style>
            span {
                color:#ccff66;
            }
            .current_cursor{
                color:#ff809f
            }
        </style>
        `
        return blinkerStyle + this.highlightCursor(nextCursorPos)
    }

    nextCursorPosition(wordListVec, cursorSymbol, index) {
        const nextPos = wordListVec.split(
            cursorSymbol, index).join(cursorSymbol).length
        return (nextPos)
    }

    highlightCursor(index) {
        const highlighted =
            this.wordListJoined.substring(0, index) +
            "<span>" + this.blankSymbol + "</span>" +
            this.wordListJoined.substring(index + 1)
        return highlighted
    }

    fillLetter(makke) {
        if (typeof makke != "boolean") {
            throw 'parameter must be boolean.'
        }
        const correctLetter = this.icka[this.currentCursorIndex]
        const correctLetterStr = this.ickoToStr(correctLetter)
        this.currentCursorIndex = this.currentCursorIndex + 1
        const selectedLetter = new Icko(correctLetter.male, correctLetter.kratke, makke)
        const selectedLetterStr = this.ickoToStr(selectedLetter)
        this.filledLetters.push(this.ickoToStr(selectedLetter))
        if (selectedLetterStr != correctLetterStr) {
            this.errors = this.errors + 1
            console.log("chyba " + this.errors + ": "+ selectedLetterStr + ", správne: " + correctLetterStr)
        }
        
    }

}

export default WordListHandler
