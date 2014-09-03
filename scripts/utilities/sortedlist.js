function SortedList(ordered) {
    'use strict';
    this.elements = [];
    this.ordered = ordered || function (a, b) {
        return a <= b;
    };
    Object.defineProperty(this, 'length', {
        get: function () { return this.elements.length; },
        set: function (l) { this.elements.length = l; }
    });
}

// returns the index at which the element was inserted
SortedList.prototype.add = function (e) {
    'use strict';
    if (this.elements.length === 0) {
        this.elements.push(e);
        return 0;
    }
    if (this.ordered(e, this.elements[0])) {
        this.elements.unshift(e);
        return 0;
    }
    if (this.ordered(this.elements[this.elements.length - 1], e)) {
        return this.elements.push(e) - 1;
    }
    var i = 1, l = 0, h = this.elements.length - 1;
    while (!(this.ordered(this.elements[i - 1], e) && this.ordered(e, this.elements[i]))) {
        i = Math.floor((l + h + 1) / 2);
        if (this.ordered(this.elements[i], e)) {
            l = i;
        } else {
            h = i;
        }
    }
    this.elements.splice(i, 0, e);
    return i;
};

SortedList.prototype.get = function (index) {
    'use strict';
    return this.elements[index];
};

SortedList.prototype.indexOf = function (element) {
    'use strict';
    return this.elements.indexOf(element);
};

SortedList.prototype.slice = function (begin, end) {
    'use strict';
    return this.elements.slice(begin, end);
};

SortedList.prototype.some = function (f, thisArg) {
    'use strict';
    return this.elements.some(f, thisArg);
};

SortedList.prototype.splice = function (index, howMany) {
    'use strict';
    return this.elements.splice(index, howMany);
};

SortedList.prototype.toString = function () {
    'use strict';
    return this.elements.toString();
};
