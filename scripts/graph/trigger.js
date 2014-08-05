/*global randomChoice, randomSample, EventHandlerList */

function Trigger(id, graph) {
    'use strict';
    this.id = id;
    this.vertices = new Set(randomSample([...graph.vertices.keys()], 5));
    graph.onaddvertex.add(function (event) {
        if (this.vertices.size < 5) {
            this.addVertex(event.data.id);
        }
    }.bind(this));
    graph.ondeletevertex.add(function (event) {
        if (this.vertices.delete(event.data.id)) {
            this.ondeletevertex.fire({id: event.data.id});
            while (this.vertices.size < Math.min(5, graph.vertices.size)) {
                this.addVertex(randomChoice([...graph.vertices.keys()]));
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