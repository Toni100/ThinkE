/*jslint browser:true */
/*global DisplayCache */

function VertexView(id, graphView, display) {
    'use strict';
    this.id = id;
    this.displayCache = display instanceof DisplayCache ? display : new DisplayCache(display);
    this.x = 10 + Math.random() * (graphView.canvas.width - 20);
    this.y = 10 + Math.random() * (graphView.canvas.height - 20);
    Object.defineProperty(this, 'display', {
        get: function () {
            return this.displayCache.get(graphView.canvas.zoom);
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