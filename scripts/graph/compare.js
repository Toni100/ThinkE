/*global ArrayBuffer, Uint8ClampedArray */

// returns a number between 0 and 1
function compareArrayBuffer(value1, value2) {
    'use strict';
    var arr1 = new Uint8ClampedArray(value1),
        arr2 = new Uint8ClampedArray(value2),
        diff = 0,
        i;
    if (arr1.length !== arr2.length) {
        return 0;
    }
    for (i = 0; i < arr1.length; i += 1) {
        diff += Math.abs(arr1[i] - arr2[i]);
    }
    diff /= arr1.length;
    return 1 / Math.max(1, diff);
}

function compareString(value1, value2) {
    'use strict';
    if (value1 === value2) {
        return 1;
    }
    return 0;
}

function compare(value1, value2) {
    'use strict';
    if (typeof value1 === 'number' && typeof value2 === 'number') {
        return 10 / Math.abs(value1 - value2);
    }
    if (value1 instanceof ArrayBuffer && value2 instanceof ArrayBuffer) {
        return compareArrayBuffer(value1, value2);
    }
    if (typeof value1 === 'string' && typeof value2 === 'string') {
        return compareString(value1, value2);
    }
    return 0;
}