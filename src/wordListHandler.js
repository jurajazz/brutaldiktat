
export class WordListHandler {
    constructor(wordListArray) {
        if (!Array.isArray(wordListArray)) {
            throw 'Parameter is not a list!';
        }
        this.blankSymbol = '_'
        this.wordList = wordListArray
        this.currentCursorIndex = 1
        this.wordListChallenge = []
        this.wordList.forEach((element, index) => {
            this.wordListChallenge.push(element.replace(/\[iy\]|\[yi\]|y|ý|i|í/gi, this.blankSymbol))
        });
        this.wordListJoined = this.wordListChallenge.join(', ')
    }

    moveCursorRight() {
        const nextCursorPos = this.nextCursorPosition(this.wordListJoined, this.blankSymbol, this.currentCursorIndex)
        this.currentCursorIndex = this.currentCursorIndex + 1
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
            this.wordListJoined.substring(index + 1);
        return highlighted
    }

}

export default WordListHandler