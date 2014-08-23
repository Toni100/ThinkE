/*jslint browser: true */

function zoomify(element, f) {
    'use strict';
    element.zoom = 1;
    element.shiftX = 0;
    element.shiftY = 0;
    element.onwheel = function (event) {
        var lastZoom = this.zoom,
            x = event.layerX,
            y = event.layerY;
        if (window.getComputedStyle(this).position !== 'absolute') {
            x -= this.offsetLeft;
            y -= this.offsetTop;
        }
        if (event.deltaY < 0) {
            this.zoom *= 1.07;
        } else if (event.deltaY > 0) {
            this.zoom /= 1.07;
        }
        this.shiftX = x - (x - this.shiftX) / lastZoom * this.zoom;
        this.shiftY = y - (y - this.shiftY) / lastZoom * this.zoom;
        if (f) { f(); }
        return false;
    };
    element.onmousemove = function (event) {
        if (event.buttons !== 1) { return; }
        this.shiftX += event.mozMovementX;
        this.shiftY += event.mozMovementY;
        if (f) { f(); }
    };
    return element;
}