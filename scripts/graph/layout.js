/*jslint browser: true */
/*global self */

var vertices = new Map(),
    edges = new Map(),
    running = false,
    remaining = 0,
    postingPositions = false,
    pointerX,
    pointerY;

function Vertex(id, x, y) {
    'use strict';
    this.id = id;
    this.x = x;
    this.y = y;
    this.weight = 1;
    this.fx = 0;
    this.fy = 0;
    this.vx = 0;
    this.vy = 0;
}

Vertex.prototype.distance = function (other) {
    'use strict';
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
};

Vertex.prototype.hasPointer = function () {
    'use strict';
    return pointerX - 6 < this.x && this.x < pointerX + 6 &&
        pointerY - 6 < this.y && this.y < pointerY + 6;
};

Vertex.prototype.move = function () {
    'use strict';
    if (this.fixed || this.hasPointer()) { return; }
    this.vx += this.fx / this.weight;
    this.vy += this.fy / this.weight;
    this.vx *= 0.8;
    this.vy *= 0.8;
    this.x += this.vx;
    this.y += this.vy;
    this.fx = 0;
    this.fy = 0;
};

Vertex.prototype.repel = function (other) {
    'use strict';
    var f = 0.5 * Math.pow(Math.max(this.distance(other), 5), -2),
        fx = f * (this.x - other.x),
        fy = f * (this.y - other.y);
    this.fx += fx;
    this.fy += fy;
    other.fx -= fx;
    other.fy -= fy;
};

function Edge(id, v1id, v2id) {
    'use strict';
    this.id = id;
    this.v1 = vertices.get(v1id);
    this.v2 = vertices.get(v2id);
    this.v1.weight += 1;
    this.v2.weight += 1;
}

Edge.prototype.attract = function () {
    'use strict';
    var f = 0.0002 * Math.min(this.v1.distance(this.v2) - 30, 50),
        fx = f * (this.v2.x - this.v1.x),
        fy = f * (this.v2.y - this.v1.y);
    this.v1.fx += fx;
    this.v1.fy += fy;
    this.v2.fx -= fx;
    this.v2.fy -= fy;
};

Edge.prototype.destroy = function () {
    'use strict';
    this.v1.weight -= 1;
    this.v2.weight -= 1;
};

function computeForces() {
    'use strict';
    var varr = Array.from(vertices.values()),
        i,
        j;
    for (i = 0; i < varr.length; i += 1) {
        for (j = i + 1; j < varr.length; j += 1) {
            varr[i].repel(varr[j]);
        }
    }
    edges.forEach(function (e) { e.attract(); });
}

function postPositions() {
    'use strict';
    if (postingPositions) { return; }
    postingPositions = true;
    setTimeout(function () {
        postingPositions = false;
        self.postMessage({vertices: Array.from(vertices.values(), function (v) {
            return {id: v.id, x: v.x, y: v.y};
        })});
    }, 1);
}

function layOut(countDown) {
    'use strict';
    if (countDown) { remaining -= 1; } else { remaining = 300; }
    if (running) { return; }
    running = true;
    setTimeout(function () {
        running = false;
        computeForces();
        vertices.forEach(function (v) { v.move(); });
        postPositions();
        if (remaining > 0) { layOut(true); }
    }, 1);
}

self.onmessage = function (event) {
    'use strict';
    if (event.data.addvertices) {
        event.data.addvertices.forEach(function (v) {
            vertices.set(v.id, new Vertex(v.id, v.x, v.y));
        });
        layOut();
    }
    if (event.data.addedges) {
        event.data.addedges.forEach(function (e) {
            edges.set(e.id, new Edge(e.id, e.v1id, e.v2id));
        });
        layOut();
    }
    if (event.data.deleteedges) {
        event.data.deleteedges.forEach(function (e) {
            edges.get(e.id).destroy();
            edges.delete(e.id);
        });
        layOut();
    }
    if (event.data.deletevertices) {
        event.data.deletevertices.forEach(function (v) {
            vertices.delete(v.id);
        });
        layOut();
    }
    if (event.data.setpointer) {
        pointerX = event.data.setpointer.x;
        pointerY = event.data.setpointer.y;
    }
    if (event.data.fixvertex) {
        var v = vertices.get(event.data.fixvertex.id);
        v.fixed = true;
        v.x = event.data.fixvertex.x;
        v.y = event.data.fixvertex.y;
    }
    if (event.data.clear) {
        this.vertices.clear();
        this.edges.clear();
    }
};
