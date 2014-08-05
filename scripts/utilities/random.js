function randomInteger(min, max) {
    'use strict';
    return Math.floor(min + (max - min + 1) * Math.random());
}

function randomChoice(list) {
    'use strict';
    var arr = [];
    list.forEach(function (e) {
        arr.push(e);
    });
    return arr[randomInteger(0, arr.length - 1)];
}

function randomSample(list, n) {
    'use strict';
    var sample = [],
        remaining = list instanceof Array ? list.length : list.size;
    list.forEach(function (e) {
        if (Math.random() < (n - sample.length) / remaining) {
            sample.push(e);
        }
        remaining -= 1;
    });
    return sample;
}