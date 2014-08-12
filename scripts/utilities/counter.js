function makeCounter(start) {
    'use strict';
    var i = typeof start === 'number' ? start - 1 : 0;
    return function () {
        i += 1;
        return i;
    }
}