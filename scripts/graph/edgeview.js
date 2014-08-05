function EdgeView(id, vertex1, vertex2) {
    'use strict';
    this.id = id;
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.vertex1.weight += 1;
    this.vertex2.weight += 1;
}

EdgeView.prototype.attract = function () {
    'use strict';
    var f = 0.001 * Math.min(this.distance() - 20, 50) / (this.vertex1.weight + this.vertex2.weight),
        fx = f * (this.vertex2.x - this.vertex1.x),
        fy = f * (this.vertex2.y - this.vertex1.y);
    this.vertex1.force[0] += fx;
    this.vertex1.force[1] += fy;
    this.vertex2.force[0] -= fx;
    this.vertex2.force[1] -= fy;
};

EdgeView.prototype.copy = function (newVertex1, newVertex2) {
    'use strict';
    return new EdgeView(this.id, newVertex1, newVertex2);
};

EdgeView.prototype.distance = function () {
    'use strict';
    return this.vertex1.distance(this.vertex2);
};