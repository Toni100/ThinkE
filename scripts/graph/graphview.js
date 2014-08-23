/*jslint browser: true */
/*global VertexView, EdgeView, TriggerView, zoomify, randomSample */
/*global requestAnimationFrame, Worker */

function GraphView(canvas, graph) {
    'use strict';
    this.vertices = new Map();
    this.reducedVertices = [];
    this.edges = new Map();
    this.reducedEdges = [];
    this.triggers = new Map();
    var g = null,
        handleOnaddvertex = function (event) {
            this.addVertex(new VertexView(event.data.id, this, event.data.view));
        }.bind(this),
        handleOnaddedge = function (event) {
            this.addEdge(new EdgeView(event.data.id, this.vertices.get(event.data.vertex1id), this.vertices.get(event.data.vertex2id)));
        }.bind(this),
        handleOndeleteedge = function (event) {
            this.deleteEdge(event.data.id);
        }.bind(this),
        handleOndeletevertex = function (event) {
            this.deleteVertex(event.data.id);
        }.bind(this),
        handleOnaddtrigger = function (event) {
            this.triggers.set(event.data.id, new TriggerView(event.data.id, this));
        }.bind(this);
    Object.defineProperty(this, 'graph', {
        get: function () {
            return g;
        },
        set: function (graph) {
            if (g) {
                g.onaddvertex.delete(handleOnaddvertex);
                g.onaddedge.delete(handleOnaddedge);
                g.ondeleteedge.delete(handleOndeleteedge);
                g.ondeletevertex.delete(handleOndeletevertex);
                g.onaddtrigger.delete(handleOnaddtrigger);
            }
            g = graph;
            if (g) {
                g.onaddvertex.add(handleOnaddvertex);
                g.onaddedge.add(handleOnaddedge);
                g.ondeleteedge.add(handleOndeleteedge);
                g.ondeletevertex.add(handleOndeletevertex);
                g.onaddtrigger.add(handleOnaddtrigger);
                g.vertices.forEach(function (v) {
                    this.vertices.set(v.id, new VertexView(v.id, this));
                }, this);
                g.edges.forEach(function (e) {
                    this.edges.set(e.id, new EdgeView(e.id, this.vertices.get(e.vertex1.id), this.vertices.get(e.vertex2.id)));
                }, this);
            }
        }
    });
    this.layout = new Worker('scripts/graph/layout.js');
    this.layout.onmessage = function (event) {
        if (event.data.vertices) {
            event.data.vertices.forEach(function (v) {
                var vw = this.vertices.get(v.id);
                if (!vw) { return; }
                vw.x = v.x;
                vw.y = v.y;
            }, this);
            this.draw();
            this.updateReducedView();
        }
    }.bind(this);
    this.canvas = zoomify(canvas, function () {
        this.draw();
        this.updateReducedView();
    }.bind(this));
    this.canvas.onmousemove = function (event) {
        this.layout.postMessage({setpointer: {
            x: (event.layerX - this.canvas.shiftX) / this.canvas.zoom,
            y: (event.layerY - this.canvas.shiftY) / this.canvas.zoom
        }});
    }.bind(this);
    if (graph) {
        this.graph = graph;
    }
}

GraphView.prototype.addEdge = function (ev) {
    'use strict';
    this.edges.set(ev.id, ev);
    this.reducedEdges.push(ev);
    this.layout.postMessage({addedges: [{id: ev.id, v1id: ev.vertex1.id, v2id: ev.vertex2.id}]});
};

GraphView.prototype.addVertex = function (vw) {
    'use strict';
    this.vertices.set(vw.id, vw);
    this.reducedVertices.push(vw);
    this.layout.postMessage({addvertices: [{id: vw.id, x: vw.x, y: vw.y}]});
};

GraphView.prototype.clear = function () {
    'use strict';
    this.graph = null;
    this.layout.postMessage({clear: true});
    this.vertices.clear();
    this.edges.clear();
    this.triggers.clear();
    this.reducedVertices = [];
    this.reducedEdges = [];
    this.draw();
};

GraphView.prototype.deleteEdge = function (id) {
    'use strict';
    this.edges.delete(id);
    this.layout.postMessage({deleteedges: [{id: id}]});
};

GraphView.prototype.deleteVertex = function (id) {
    'use strict';
    this.vertices.delete(id);
    this.layout.postMessage({deletevertices: [{id: id}]});
};

GraphView.prototype.draw = function () {
    'use strict';
    if (this.drawing) { return; }
    this.drawing = true;
    requestAnimationFrame(function () {
        this.drawing = false;
        var context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // triggers
        context.beginPath();
        context.strokeStyle = 'rgba(0, 200, 100, 0.3)';
        context.fillStyle = 'red';
        this.triggers.forEach(function (t) {
            t.draw(context, this.canvas.zoom, this.canvas.shiftX, this.canvas.shiftY);
        }, this);
        context.stroke();

        // edges
        context.beginPath();
        context.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        this.reducedEdges.forEach(function (e) {
            context.moveTo(e.vertex1.xt, e.vertex1.yt);
            context.lineTo(e.vertex2.xt, e.vertex2.yt);
        });
        context.stroke();

        // vertices
        this.reducedVertices.forEach(function (v) {
            v.draw(context);
        }, this);
    }.bind(this));
};

GraphView.prototype.updateReducedView = function (delay) {
    'use strict';
    if (this.updatingReducedView) { return; }
    this.updatingReducedView = true;
    setTimeout(function () {
        this.updatingReducedView = false;

        this.reducedVertices = [];
        this.vertices.forEach(function (v) {
            if (v.visible) { this.reducedVertices.push(v); }
        }, this);
        this.reducedVertices = randomSample(this.reducedVertices, 200);

        this.reducedEdges = [];
        this.edges.forEach(function (e) {
            if (e.vertex1.visible || e.vertex2.visible) { this.reducedEdges.push(e); }
        }, this);
        this.reducedEdges = randomSample(this.reducedEdges, 800);
        this.draw();
    }.bind(this), typeof delay === 'number' ? delay : 1800);
};