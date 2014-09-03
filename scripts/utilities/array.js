function deleteDuplicates(arr, test) {
    'use strict';
    var unique = [],
        t = test || function (a, b) { return a === b; };
    arr.forEach(function (e) {
        if (!unique.some(function (u) { return t(e, u); })) { unique.push(e); }
    });
    return unique;
}
