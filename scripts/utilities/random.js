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

// use when n much smaller than arr.length
function smallRandomSample(arr, n) {
    'use strict';
    var sample = [],
        used = [],
        r;
    while (sample.length < Math.min(arr.length, n)) {
        r = randomInteger(0, arr.length - 1);
        if (used.indexOf(r) === -1) {
            used.push(r);
            sample.push(arr[r]);
        }
    }
    return sample;
}

function randomSample(list, n) {
    'use strict';
    if (list instanceof Array && n <= list.length / 10) {
        return smallRandomSample(list, n);
    }
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
