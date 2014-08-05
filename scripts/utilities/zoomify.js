function zoomify(element, f) {
    'use strict';
    element.zoom = 1;
    element.shiftX = 0;
    element.shiftY = 0;
    element.onwheel = function (event) {
        var zoomOld = this.zoom;
        if (event.deltaY < 0) {
            this.zoom *= 1.07;
        } else if (event.deltaY > 0) {
            this.zoom /= 1.07;
        }
        this.shiftX = event.layerX - (event.layerX - this.shiftX) / zoomOld * this.zoom;
        this.shiftY = event.layerY - (event.layerY - this.shiftY) / zoomOld * this.zoom;
        if (f) {
            f();
        }
        return false;
    };
    return element;
}