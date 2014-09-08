/*jslint browser: true */
/*global deleteDuplicates, EventHandlerList, imageToArrayBuffer, makeCounter, Queue, randomChoice, randomSample */
/*global Worker, File, ArrayBuffer */

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

function Trigger(id, graph) {
    'use strict';
    this.id = id;
    this.vertices = new Set(randomSample(Array.from(graph.vertices.keys()), 5));
    graph.onaddvertex.add(function (event) {
        if (this.vertices.size < 5) {
            this.addVertex(event.data.id);
        }
    }.bind(this));
    graph.ondeletevertex.add(function (event) {
        if (this.vertices.delete(event.data.id)) {
            this.ondeletevertex.fire({id: event.data.id});
            while (this.vertices.size < Math.min(5, graph.vertices.size)) {
                this.addVertex(randomChoice(graph.vertices.keys()));
            }
        }
    }.bind(this));
    this.onaddvertex = new EventHandlerList();
    this.ondeletevertex = new EventHandlerList();
}

Trigger.prototype.addVertex = function (id) {
    'use strict';
    if (!this.vertices.has(id)) {
        this.vertices.add(id);
        this.onaddvertex.fire({id: id});
    }
};

function Graph(queue, imageCache) {
    'use strict';
    this.queue = queue || new Queue();
    this.imageCache = imageCache || new CacheList(loadImage);
    this.vertices = new Map();
    this.triggers = new Map();
    this.edges = new Map();
    this.searches = new Map();
    this.makeID = makeCounter();
    this.minVertices = 10;
    this.connect = new Worker('scripts/graph/connect.js');
    this.connect.onmessage = function (event) {
        if (event.data.addedEdges) {
            event.data.addedEdges.forEach(function (e) {
                this.addEdgeByVertexIDs(e[0], e[1], e[2]);
            }, this);
        }
        if (event.data.deletedEdges) {
            event.data.deletedEdges.forEach(function (id) {
                if (!this.edges.has(id)) { return; }
                this.edges.delete(id);
                this.ondeleteedge.fire({id: id});
            }, this);
        }
        if (event.data.vertexConnected) {
            this.onvertexconnected.fire(event.data.vertexConnected);
        }
        if (event.data.foundDuplicates) {
            this.searches.get(event.data.foundDuplicates.id)(event.data.foundDuplicates.result);
            this.searches.delete(event.data.foundDuplicates.id);
        }
        if (event.data.foundSimilar) {
            this.searches.get(event.data.foundSimilar.id)(event.data.foundSimilar.result);
            this.searches.delete(event.data.foundSimilar.id);
        }
    }.bind(this);
    this.onaddvertex = new EventHandlerList();
    this.onaddedge = new EventHandlerList();
    this.ondeleteedge = new EventHandlerList();
    this.ondeletevertex = new EventHandlerList();
    this.onvertexconnected = new EventHandlerList();
    this.onaddtrigger = new EventHandlerList();
    this.onaddvertex.add(function (event) {
        this.connect.postMessage(
            {addVertex: {id: event.data.id, value: event.data.feature}},
            event.data.feature instanceof ArrayBuffer ? [event.data.feature] : []
        );
        if (this.triggers.size / this.vertices.size < 0.1) {
            this.addTrigger();
        }
    }.bind(this));
    this.onvertexconnected.add(this.deleteDuplicates.bind(this));
}

Graph.prototype.add = function (value) {
    'use strict';
    var id = this.makeID();
    if (isImageFile(value)) {
        this.imageCache.get(value).promise.then(function (img) {
            this.addImage(img, id, value);
        }.bind(this));
    } else if (value instanceof Image) {
        this.addImage(value, id);
    } else {
        this.queue.add(function (finish) {
            var v = new Vertex(id, value);
            this.vertices.set(id, v);
            this.onaddvertex.fire({vertex: v, id: id, feature: value, view: value});
            finish();
        }.bind(this));
    }
    return id;
};

Graph.prototype.addEdge = function (edge) {
    'use strict';
    this.edges.set(edge.id, edge);
    this.onaddedge.fire({id: edge.id, vertex1id: edge.vertex1.id, vertex2id: edge.vertex2.id});
};

Graph.prototype.addEdgeByVertexIDs = function (id1, id2, eid) {
    'use strict';
    var v1 = this.vertices.get(id1),
        v2 = this.vertices.get(id2);
    if (v1 && v2) {
        this.addEdge(new Edge(eid, v1, v2));
    }
};

Graph.prototype.addImage = function (img, id, file) {
    'use strict';
    this.queue.prepend(function (finish) {
        var v = new Vertex(id, file || img);
        this.vertices.set(id, v);
        this.onaddvertex.fire({vertex: v, id: id, feature: imageToArrayBuffer(img, 50, 50), view: img});
        finish();
    }.bind(this));
};

Graph.prototype.addTrigger = function () {
    'use strict';
    var id = this.makeID();
    this.triggers.set(id, new Trigger(id, this));
    this.onaddtrigger.fire({id: id});
    return id;
};

Graph.prototype.deleteDuplicates = function () {
    'use strict';
    if (this.deletingDuplicates || this.vertices.size <= 1.5 * this.minVertices) { return; }
    this.deletingDuplicates = true;
    setTimeout(function () {
        this.searchDuplicates(function (result) {
            this.deletingDuplicates = false;
            if (!result.length) { return; }
            result.some(function (id) {
                this.vertices.delete(id);
                this.connect.postMessage({deleteVertex: {id: id}});
                this.ondeletevertex.fire({id: id});
                return this.vertices.size <= this.minVertices;
            }, this);
            this.deleteDuplicates();
        }.bind(this));
    }.bind(this), 2000);
};

Graph.prototype.in = function (id) {
    'use strict';
    var incoming = [];
    this.edges.forEach(function (e) {
        if (e.vertex2.id === id) {
            incoming.push(e.vertex1.id);
        }
    });
    return incoming;
};

Graph.prototype.nearest = function (id, n) {
    'use strict';
    if (n < 0) {
        return [];
    }
    if (n === 0) {
        return [id];
    }
    if (n === 1) {
        return deleteDuplicates([id].concat(this.out(id)).concat(this.in(id)));
    }
    var nearest = new Set();
    this.nearest(id, n - 1).forEach(function (id) {
        this.nearest(id, 1).forEach(function (id) {
            nearest.add(id);
        }, this);
    }, this);
    return Array.from(nearest);
};

Graph.prototype.nearestTriggers = function (id, n) {
    'use strict';
    var triggers = new Set();
    this.nearest(id, n).forEach(function (id) {
        this.triggers.forEach(function (t) {
            if (t.vertices.has(id)) {
                triggers.add(t.id);
            }
        });
    }, this);
    return triggers;
};

Graph.prototype.out = function (id) {
    'use strict';
    var outgoing = [];
    this.edges.forEach(function (e) {
        if (e.vertex1.id === id) {
            outgoing.push(e.vertex2.id);
        }
    });
    return outgoing;
};

Graph.prototype.searchDuplicates = function (callback) {
    'use strict';
    var id = this.makeID();
    this.searches.set(id, callback);
    this.connect.postMessage({searchDuplicates: {id: id}});
};

Graph.prototype.searchSimilar = function (value, n, callback) {
    'use strict';
    var id = this.makeID();
    this.searches.set(id, callback);
    this.connect.postMessage({searchSimilar: {id: id, value: value, n: n}});
};
