function Edge(id, vertex1, vertex2) {
    'use strict';
    this.id = id;
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
}

Edge.prototype.toString = function () {
    'use strict';
    return this.vertex1.toString() + ' -> ' + this.vertex2.toString();
};