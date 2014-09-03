/*jslint browser: true */
/*global self, compare, Diff, makeCounter, SortedList, deleteDuplicates */

self.importScripts('../utilities/array.js', '../utilities/counter.js', '../utilities/diff.js', '../utilities/sortedlist.js', 'compare.js');

var maxEdges = 4,
    vertices = new Map(),
    makeID = makeCounter(),
    vertexDiff = new Diff(),
    edgeDiff = new Diff(),
    postingChanges;

function postChanges() {
    'use strict';
    if (postingChanges) { return; }
    postingChanges = true;
    setTimeout(function () {
        postingChanges = false;
        self.postMessage({
            addedEdges: Array.from(edgeDiff.added, function (e) {
                return [e.vertex1.id, e.vertex2.id, e.id];
            }),
            deletedEdges: Array.from(edgeDiff.deleted, function (e) {
                return e.id;
            })
        });
        vertexDiff.added.forEach(function (v) {
            self.postMessage({vertexConnected: {id: v.id}});
        });
        vertexDiff.clear();
        edgeDiff.clear();
    }, 40);
}

function Edge(vertex1, vertex2, score) {
    'use strict';
    this.id = makeID();
    this.vertex1 = vertex1;
    this.vertex2 = vertex2;
    this.score = typeof score === 'number' ? score : compare(vertex1.value, vertex2.value);
}

function Vertex(id, value) {
    'use strict';
    this.id = id;
    this.value = value;
    this.edgeCache = new SortedList(function (a, b) {
        return a.score >= b.score;
    });
    Object.defineProperty(this, 'edges', {get : function () {
        return this.edgeCache.slice(0, Math.min(this.edgeCache.length, maxEdges));
    }});
}

Vertex.prototype.addEdge = function (edge) {
    'use strict';
    if (this.edgeCache.add(edge) < maxEdges) {
        edgeDiff.add(edge);
        if (this.edgeCache.length > maxEdges) {
            edgeDiff.delete(this.edgeCache.get(maxEdges));
        }
    }
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

function addVertex(id, value) {
    'use strict';
    var vertex = new Vertex(id, value),
        e;
    vertices.forEach(function (v) {
        e = new Edge(v, vertex);
        v.addEdge(e);
        e = new Edge(vertex, v, e.score);
        vertex.addEdge(e);
    });
    vertices.set(vertex.id, vertex);
    vertexDiff.add(vertex);
    postChanges();
}

function deleteVertex(id) {
    'use strict';
    vertices.get(id).edges.forEach(function (e) {
        edgeDiff.delete(e);
    });
    vertices.delete(id);
    vertices.forEach(function (v) {
        edgeDiff.merge(v.deleteEdgeByVertexID(id));
    });
    postChanges();
}

function searchDuplicates(id) {
    'use strict';
    var result = [],
        arr = Array.from(vertices.values()),
        i,
        j;
    for (i = 0; i < arr.length; i += 1) {
        for (j = i + 1; j < arr.length; j += 1) {
            if (arr[i].similar(arr[j])) {
                result.push([arr[i], arr[j]]);
            }
        }
    }
    result.forEach(function (pair) {
        pair.sort(function (v1, v2) { return v1.score() >= v2.score(); });
    });
    result = result.map(function (pair) { return pair[0]; });
    result.sort(function (v1, v2) { return v1.score() >= v2.score(); });
    result = deleteDuplicates(result);
    result = result.filter(function (v) { return v.score() > 0.1; });
    result = result.map(function (v) { return v.id; });
    self.postMessage({foundDuplicates: {id: id, result: result}});
}

function searchSimilar(id, value, n) {
    'use strict';
    var result = [];
    vertices.forEach(function (v) {
        result.push([v.id, compare(value, v.value)]);
    });
    result.sort(function (a, b) {
        return b[1] - a[1];
    });
    result = result.slice(0, n);
    self.postMessage({foundSimilar: {id: id, result: result}});
}

self.onmessage = function (event) {
    'use strict';
    if (event.data.addVertex) {
        addVertex(event.data.addVertex.id, event.data.addVertex.value);
    }
    if (event.data.deleteVertex) {
        deleteVertex(event.data.deleteVertex.id);
    }
    if (event.data.searchDuplicates) {
        searchDuplicates(event.data.searchDuplicates.id);
    }
    if (event.data.searchSimilar) {
        searchSimilar(event.data.searchSimilar.id, event.data.searchSimilar.value, event.data.searchSimilar.n);
    }
};
