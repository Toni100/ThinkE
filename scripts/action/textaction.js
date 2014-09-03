/*global EventHandlerList */

function TextAction() {
    'use strict';
    this.wordSeparators = ' .?';
    this.sentenceSeparators = '.?';
    this.recent = '';
    this.currentWord = '';
    this.currentSentence = '';
    this.onchangerecent = new EventHandlerList();
    this.onword = new EventHandlerList();
    this.onsentence = new EventHandlerList();
}

TextAction.prototype.add = function (char) {
    'use strict';
    // recent
    this.recent += char;
    if (this.recent.length > 250) {
        this.recent = this.recent.substr(50);
    }
    this.onchangerecent.fire({recent: this.recent});

    // word
    if (this.wordSeparators.indexOf(char) !== -1) {
        this.onword.fire({word: this.currentWord});
        this.currentWord = '';
    } else {
        this.currentWord += char;
    }

    // sentence
    this.currentSentence += char;
    if (this.sentenceSeparators.indexOf(char) !== -1) {
        this.onsentence.fire({sentence: this.currentSentence});
        this.currentSentence = '';
    }
};
