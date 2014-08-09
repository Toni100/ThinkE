function EdgeView(id, vertex1, vertex2) {
    'use strict';
    this.id = id;
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
}

EdgeView.prototype.copy = function (newVertex1, newVertex2) {
    'use strict';
    return new EdgeView(this.id, newVertex1, newVertex2);
};