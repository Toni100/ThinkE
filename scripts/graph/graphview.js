/*jslint browser: true */
/*global VertexView, EdgeView, TriggerView, zoomify, randomSample */
/*global requestAnimationFrame */

function GraphView(graph, canvas) {
    'use strict';
    this.vertices = new Map();
    this.edges = new Map();
    this.triggers = new Map();
    this.canvas = zoomify(canvas, this.draw.bind(this));
    this.canvas.onmousemove = function (event) {
        this.pointerX = event.layerX;
        this.pointerY = event.layerY;
    }.bind(this);
    if (!graph) {
        return;
    }
    this.graph = graph;
    this.graph.vertices.forEach(function (v) {
        this.vertices.set(v.id, new VertexView(v.id, this));
    }, this);
    this.graph.edges.forEach(function (e) {
        this.edges.set(
            e.id,
            new EdgeView(e.id, this.vertices.get(e.vertex1.id), this.vertices.get(e.vertex2.id))
        );
    }, this);
    this.graph.onaddvertex.add(function (event) {
        this.vertices.set(event.data.id, new VertexView(event.data.id, this, event.data.view));
        this.layOut();
    }.bind(this));
    this.graph.onaddedge.add(function (event) {
        this.edges.set(
            event.data.id,
            new EdgeView(event.data.id, this.vertices.get(event.data.vertex1id), this.vertices.get(event.data.vertex2id))
        );
        this.layOut();
    }.bind(this));
    this.graph.ondeleteedge.add(function (event) {
        this.edges.get(event.data.id).vertex1.weight -= 1;
        this.edges.get(event.data.id).vertex2.weight -= 1;
        this.edges.delete(event.data.id);
        this.layOut();
    }.bind(this));
    this.graph.ondeletevertex.add(function (event) {
        this.vertices.delete(event.data.id);
        this.layOut();
    }.bind(this));
    this.graph.onaddtrigger.add(function (event) {
        this.triggers.set(event.data.id, new TriggerView(event.data.id, this));
    }.bind(this));
}

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
        this.edges.forEach(function (e) {
            context.moveTo(e.vertex1.xt, e.vertex1.yt);
            context.lineTo(e.vertex2.xt, e.vertex2.yt);
        });
        context.stroke();

        // vertices
        this.vertices.forEach(function (v) {
            v.draw(context);
        }, this);
    }.bind(this));
};

GraphView.prototype.filter = function (vertexIDs, canvas) {
    'use strict';
    var gv = new GraphView(null, canvas);
    this.vertices.forEach(function (v) {
        if (vertexIDs.indexOf(v.id) !== -1) {
            gv.vertices.set(v.id, new VertexView(v.id, gv, v.displayCache));
        }
    });
    this.edges.forEach(function (e) {
        if (gv.vertices.has(e.vertex1.id) && gv.vertices.has(e.vertex2.id)) {
            gv.edges.set(e.id, e.copy(gv.vertices.get(e.vertex1.id), gv.vertices.get(e.vertex2.id)));
        }
    });
    gv.layOut();
    return gv;
};

GraphView.prototype.layOut = function () {
    'use strict';
    this.animationFramesRemaining = 200;
    if (this.animationRunning) {
        return;
    }
    this.animationRunning = true;
    requestAnimationFrame(function () {
        this.layOutStep();
    }.bind(this));
};

GraphView.prototype.layOutStep = function () {
    'use strict';
    if (!this.animationFramesRemaining) {
        this.animationRunning = false;
        return;
    }
    this.animationFramesRemaining -= 1;
    randomSample(this.vertices, Math.ceil(5000 / this.vertices.size)).forEach(function (v1) {
        this.vertices.forEach(function (v2) {
            v1.repelFrom(v2);
        });
    }, this);
    randomSample(this.edges, 500).forEach(function (e) { e.attract(); });
    this.vertices.forEach(function (v) { v.move(); });
    this.draw();
    requestAnimationFrame(function () {
        this.layOutStep();
    }.bind(this));
};