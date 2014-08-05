/*jslint browser:true */
/*global DisplayCache */

function VertexView(id, graphView, display) {
    'use strict';
    this.id = id;
    this.displayCache = display instanceof DisplayCache ? display : new DisplayCache(display);
    this.x = 10 + Math.random() * (graphView.canvas.width - 20);
    this.y = 10 + Math.random() * (graphView.canvas.height - 20);
    this.weight = 1;
    this.force = [0, 0];
    this.velocity = [0, 0];
    Object.defineProperty(this, 'display', {
        get: function () {
            return this.displayCache.get(graphView.canvas.zoom);
        }
    });
    Object.defineProperty(this, 'fixed', {
        get: function () {
            return graphView.pointerX - this.wt / 2 - 10 < this.xt &&
                this.xt < graphView.pointerX + this.wt / 2 + 10 &&
                graphView.pointerY - this.ht / 2 - 10 < this.yt &&
                this.yt < graphView.pointerY + this.ht / 2 + 10;
        }
    });
    Object.defineProperty(this, 'h', {
        get: function () {
            return this.displayCache.height;
        }
    });
    Object.defineProperty(this, 'ht', {
        get: function () {
            return this.displayCache.height * graphView.canvas.zoom;
        }
    });
    Object.defineProperty(this, 'visible', {
        get: function () {
            return this.xt > -this.wt / 2 && this.xt < graphView.canvas.width + this.wt / 2 &&
                this.yt > -this.ht / 2 && this.yt < graphView.canvas.height + this.ht / 2;
        }
    });
    Object.defineProperty(this, 'w', {
        get: function () {
            return this.displayCache.width;
        }
    });
    Object.defineProperty(this, 'wt', {
        get: function () {
            return this.displayCache.width * graphView.canvas.zoom;
        }
    });
    Object.defineProperty(this, 'xt', {
        get: function () {
            return this.x * graphView.canvas.zoom + graphView.canvas.shiftX;
        }
    });
    Object.defineProperty(this, 'yt', {
        get: function () {
            return this.y * graphView.canvas.zoom + graphView.canvas.shiftY;
        }
    });
}

VertexView.prototype.distance = function (vertex) {
    'use strict';
    return Math.max(
        1,
        Math.sqrt(Math.pow(this.x - vertex.x, 2) + Math.pow(this.y - vertex.y, 2)) -
            1.1 * (this.w + this.h + vertex.w + vertex.h) / 4
    );
};

VertexView.prototype.draw = function (context) {
    'use strict';
    if (!this.visible) { return; }
    if (this.display instanceof Image) {
        context.drawImage(this.display, this.xt - this.wt / 2, this.yt - this.ht / 2, this.wt, this.ht);
    } else if (typeof this.display === 'string') {
        context.fillStyle = 'black';
        context.fillText(this.display, this.xt, this.yt);
    } else {
        context.fillStyle = 'gray';
        context.fillRect(this.xt - 2, this.yt - 2, 4, 4);
    }
};

VertexView.prototype.fix = function (x, y) {
    'use strict';
    this.fixed1 = true;
    this.x = x;
    this.y = y;
};

VertexView.prototype.move = function () {
    'use strict';
    if (this.fixed1 || this.fixed) { return; }
    this.velocity[0] += this.force[0] / this.weight;
    this.velocity[1] += this.force[1] / this.weight;
    this.velocity[0] *= 0.8;
    this.velocity[1] *= 0.8;
    this.x += this.velocity[0];
    this.y += this.velocity[1];
    this.force = [0, 0];
};

VertexView.prototype.repelFrom = function (v) {
    'use strict';
    if (this === v) { return; }
    var f = 2 * Math.pow(Math.max(this.distance(v), 1), -2) * Math.sqrt((this.weight + v.weight) / 2);
    this.force[0] += f * (this.x - v.x);
    this.force[1] += f * (this.y - v.y);
};