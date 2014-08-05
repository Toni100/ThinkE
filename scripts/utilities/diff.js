function Diff() {
    'use strict';
    this.added = new Set();
    this.deleted = new Set();
}

Diff.prototype.add = function (element) {
    'use strict';
    if (this.deleted.has(element)) {
        this.deleted.delete(element);
    } else {
        this.added.add(element);
    }
};

Diff.prototype.delete = function (element) {
    'use strict';
    if (this.added.has(element)) {
        this.added.delete(element);
    } else {
        this.deleted.add(element);
    }
};

Diff.prototype.merge = function (diff) {
    'use strict';
    diff.added.forEach(function (a) {
        this.add(a);
    }, this);
    diff.deleted.forEach(function (d) {
        this.delete(d);
    }, this);
};