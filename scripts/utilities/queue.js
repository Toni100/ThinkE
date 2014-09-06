/*jslint browser: true */

function Queue() {
    'use strict';
    this.elements = [];
}

Queue.prototype.add = function (element) {
    'use strict';
    this.elements.push(element);
    if (!this.running) {
        this.next();
    }
};

Queue.prototype.next = function () {
    'use strict';
    if (this.elements.length === 0) {
        this.running = false;
        return;
    }
    this.running = true;
    setTimeout(function () {
        this.elements.shift()(this.next.bind(this));
    }.bind(this), 10);
};

Queue.prototype.prepend = function (element) {
    'use strict';
    this.elements.unshift(element);
    if (!this.running) {
        this.next();
    }
};
