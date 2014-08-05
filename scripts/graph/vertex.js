/*global File */

function Vertex(id, value) {
    'use strict';
    this.id = id;
    this.value = value;
}

Vertex.prototype.toString = function () {
    'use strict';
    if (this.value instanceof File) {
        return this.value.name;
    }
    return this.value.toString();
};