/*global self, compare, Diff, makeCounter, SortedList, deleteDuplicates */

// for Firefox < 32
Array.from = function (iterable) {
    'use strict';
    var arr = [];
    iterable.forEach(function (e) {
        arr.push(e);
    });
    return arr;
};

self.importScripts('../utilities/array.js', '../utilities/counter.js', '../utilities/diff.js', '../utilities/sortedlist.js', 'compare.js');

var maxEdges = 4,
    vertices = new Map(),
    makeID = makeCounter();

function Edge(vertex1, vertex2, score) {
    'use strict';
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.score = typeof score === 'number' ? score : compare(vertex1.value, vertex2.value);
    this.id = makeID();
}

function Vertex(value, id) {
    'use strict';
    this.value = value;
    this.id = id;
    this.edgeCache = new SortedList(function (a, b) {
        return a.score >= b.score;
    });
    Object.defineProperty(this, 'edges', {get : function () {
        return this.edgeCache.slice(0, Math.min(this.edgeCache.length, maxEdges));
    }});
}

Vertex.prototype.addEdge = function (edge) {
    'use strict';
    var diff = new Diff();
    if (this.edgeCache.add(edge) < maxEdges) {
        diff.add(edge);
        if (this.edgeCache.length > maxEdges) {
            diff.delete(this.edgeCache.get(maxEdges));
        }
    }
    return diff;
};

Vertex.prototype.deleteEdgeByVertexID = function (id) {
    'use strict';
    var diff = new Diff();
    this.edgeCache.some(function (e, i) {
        if (e.vertex2.id === id) {
            if (i < maxEdges) {
                diff.delete(e);
                if (this.edgeCache.length > maxEdges) {
                    diff.add(this.edgeCache.get(maxEdges));
                }
            }
            this.edgeCache.splice(i, 1);
            return true;
        }
    }, this);
    return diff;
};

Vertex.prototype.out = function () {
    'use strict';
    return this.edges.map(function (e) {
        return e.vertex2;
    });
};

Vertex.prototype.score = function () {
    'use strict';
    return this.edges.reduce(function (prev, curr) {
        return prev + curr.score;
    }, 0) / this.edges.length;
};

Vertex.prototype.similar = function (vertex) {
    'use strict';
    var out1 = this.out(),
        out2 = vertex.out();
    if (out1.indexOf(vertex) === -1 || out2.indexOf(this) === -1) {
        return false;
    }
    return out1.every(function (v) {
        return v === vertex || out2.indexOf(v) !== -1;
    }) && out2.every(function (v) {
        return v === this || out1.indexOf(v) !== -1;
    }, this);
};

function postChanges(diff) {
    'use strict';
    self.postMessage({
        deletedEdges: Array.from(diff.deleted).map(function (e) {
            return e.id;
        }),
        addedEdges: Array.from(diff.added).map(function (e) {
            return [e.vertex1.id, e.vertex2.id, e.id];
        })
    });
}

function add(id, value) {
    'use strict';
    var vertex = new Vertex(value, id),
        diff = new Diff(),
        e;
    vertices.forEach(function (v) {
        e = new Edge(v, vertex);
        diff.merge(v.addEdge(e));
        e = new Edge(vertex, v, e.score);
        diff.merge(vertex.addEdge(e));
    });
    vertices.set(vertex.id, vertex);
    postChanges(diff);
    self.postMessage({
        vertexConnected: {id: id}
    });
}

function deleteVertex(id) {
    'use strict';
    var diff = new Diff();
    vertices.get(id).edges.forEach(function (e) {
        diff.delete(e);
    });
    vertices.delete(id);
    vertices.forEach(function (v) {
        diff.merge(v.deleteEdgeByVertexID(id));
    });
    postChanges(diff);
}

function getSimilarVertices() {
    'use strict';
    var similar = [], arr = Array.from(vertices), i, j;
    for (i = 0; i < arr.length; i += 1) {
        for (j = i + 1; j < arr.length; j += 1) {
            if (arr[i].similar(arr[j])) {
                similar.push([arr[i], arr[j]]);
            }
        }
    }
    similar.forEach(function (pair) {
        pair.sort(function (v1, v2) { return v1.score() >= v2.score(); });
    });
    similar = similar.map(function (pair) { return pair[0]; });
    similar.sort(function (v1, v2) { return v1.score() >= v2.score(); });
    similar = deleteDuplicates(similar);
    similar = similar.filter(function (v) { return v.score() > 0.1; });
    similar = similar.map(function (v) { return v.id; });
    self.postMessage({similarVertices: similar});
}

self.onmessage = function (event) {
    'use strict';
    if (event.data.add) {
        add(event.data.add.id, event.data.add.value);
    }
    if (event.data.deleteVertex) {
        deleteVertex(event.data.deleteVertex.id);
    }
    if (event.data.getSimilarVertices) {
        getSimilarVertices();
    }
};