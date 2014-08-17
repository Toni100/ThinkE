/*global SynapseView */

function NeuronView(neuron, networkView) {
    'use strict';
    this.postSynapses = new Map();
    Object.defineProperty(this, 'color', {
        get: function () {
            if (neuron.onfire.handlers.size) { return 'rgb(0, 255, 255)'; }
            if (neuron.inputID) { return 'red'; }
            return 'rgb(255, 210, 130)';
        }
    });
    Object.defineProperty(this, 'xt', {
        get: function () {
            return networkView.canvas.width * neuron.x * networkView.canvas.zoom + networkView.canvas.shiftX;
        }
    });
    Object.defineProperty(this, 'yt', {
        get: function () {
            return networkView.canvas.height * neuron.y * networkView.canvas.zoom + networkView.canvas.shiftY;
        }
    });
}