/*jslint browser: true */
/*global Edge, Vertex, EventHandlerList, Queue, imageToArrayBuffer, Trigger */
/*global Worker, File, ArrayBuffer */

function Graph() {
    'use strict';
    this.vertices = new Map();
    this.triggers = new Map();
    this.edges = new Map();
    this.queue = new Queue();
    this.makeID = makeCounter();
    this.minVertices = 1;
    this.connect = new Worker('scripts/graph/connect.js');
    this.connect.onmessage = function (event) {
        if (event.data.addedEdges) {
            event.data.addedEdges.forEach(function (e) {
                this.addEdgeByVertexIDs(e[0], e[1], e[2]);
            }, this);
        }
        if (event.data.deletedEdges) {
            event.data.deletedEdges.forEach(function (id) {
                if (!this.edges.has(id)) { return; } // check why this can happen in deleteSimilarVertices
                this.ondeleteedge.fire({id: id});
                this.edges.delete(id);
            }, this);
        }
        if (event.data.similarVertices) {
            this.deletingSimilarVertices = false;
            if (event.data.similarVertices.length) {
                if (!event.data.similarVertices.some(function (id) {
                    if (this.vertices.size <= this.minVertices) { return true; }
                    this.ondeletevertex.fire({id: id});
                    this.vertices.delete(id);
                }, this)) {
                    this.deleteSimilarVertices();
                }
            }
        }
        if (event.data.vertexConnected) {
            this.onvertexconnected.fire({id: event.data.vertexConnected.id});
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
    this.ondeletevertex.add(function (event) {
        this.connect.postMessage({deleteVertex: {id: event.data.id}});
    }.bind(this));
    this.onvertexconnected.add(function () {
        this.deleteSimilarVertices();
    }.bind(this));
}

Graph.prototype.add = function (value) {
    'use strict';
    var id = this.makeID();
    if (value instanceof File) {
        this.addFile(value, id);
    } else if (value instanceof Image) {
        this.addImage(value, id);
    } else {
        this.queue.add(function () {
            this.vertices.set(id, new Vertex(id, value));
            this.onaddvertex.fire({id: id, feature: value, view: value});
            this.queue.next();
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

Graph.prototype.addFile = function (file, id) {
    'use strict';
    var that = this;
    this.queue.add(function () {
        var img = document.createElement('img');
        img.onload = function () {
            window.URL.revokeObjectURL(this.src);
            that.addImage(this, id, file);
            that.queue.next();
        };
        img.src = window.URL.createObjectURL(file);
    });
};

Graph.prototype.addImage = function (img, id, file) {
    'use strict';
    this.queue.prepend(function () {
        this.vertices.set(id, new Vertex(id, file || img));
        this.onaddvertex.fire({id: id, feature: imageToArrayBuffer(img, 50, 50), view: img});
        this.queue.next();
    }.bind(this));
};

Graph.prototype.addTrigger = function () {
    'use strict';
    var id = this.makeID();
    this.triggers.set(id, new Trigger(id, this));
    this.onaddtrigger.fire({id: id});
    return id;
};

Graph.prototype.deleteSimilarVertices = function () {
    'use strict';
    if (this.deletingSimilarVertices || this.vertices.size <= 1.5 * this.minVertices) {
        return;
    }
    this.deletingSimilarVertices = true;
    setTimeout(function () {
        this.connect.postMessage({getSimilarVertices: true});
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
        return [id].concat(this.out(id)).concat(this.in(id));
    }
    var nearest = new Set();
    this.nearest(id, n - 1).forEach(function (id) {
        this.nearest(id, 1).forEach(function (id) {
            nearest.add(id);
        }, this);
    }, this);
    return [...nearest];
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