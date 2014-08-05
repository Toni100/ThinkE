function TriggerView(id, graphView) {
    'use strict';
    this.id = id;
    this.vertices = new Map();
    var trigger = graphView.graph.triggers.get(id);
    trigger.vertices.forEach(function (id) {
        this.vertices.set(id, graphView.vertices.get(id));
    }, this);
    trigger.ondeletevertex.add(function (event) {
        this.vertices.delete(event.data.id);
    }.bind(this));
    trigger.onaddvertex.add(function (event) {
        this.vertices.set(event.data.id, graphView.vertices.get(event.data.id));
    }.bind(this));
    Object.defineProperty(this, 'x', {
        get: function () {
            var x = 0,
                n = 0;
            this.vertices.forEach(function (v) {
                if (v) {
                    x += v.x;
                    n += 1;
                }
            });
            return x / (n || 1);
        }
    });
    Object.defineProperty(this, 'y', {
        get: function () {
            var y = 0,
                n = 0;
            this.vertices.forEach(function (v) {
                if (v) {
                    y += v.y;
                    n += 1;
                }
            });
            return y / (n || 1);
        }
    });
}

TriggerView.prototype.draw = function (context, zoom, shiftx, shifty) {
    'use strict';
    var x = this.x * zoom + shiftx,
        y = this.y * zoom + shifty;
    this.vertices.forEach(function (v) {
        if (!v) {
            return;
        }
        context.moveTo(x, y);
        context.lineTo(v.x * zoom + shiftx, v.y * zoom + shifty);
    });
    context.fillRect(x - 2, y - 2, 4, 4);
};