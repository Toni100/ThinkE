/*global SynapseView */

function NeuronView(neuron, networkView) {
    'use strict';
    this.postSynapses = new Map();
    neuron.postSynapses.forEach(function (s) {
        this.postSynapses.set(s, new SynapseView(s, networkView));
    }, this);
    neuron.onaddpostsynapse.add(function (event) {
        this.postSynapses.set(event.data.synapse, new SynapseView(event.data.synapse, networkView));
        networkView.drawDelayed();
    }.bind(this));
    neuron.ondeletepostsynapse.add(function (event) {
        this.postSynapses.delete(event.data.synapse);
        networkView.drawDelayed();
    }.bind(this));
    Object.defineProperty(this, 'color', {
        get: function () {
            if (neuron.flags.action) { return 'rgb(0, 255, 255)'; }
            if (neuron.flags.input) { return 'red'; }
            return 'rgb(255, 210, 130)';
        }
    });
    Object.defineProperty(this, 'xt', {
        get: function () {
            return (10 + (networkView.canvas.width - 20) * neuron.x) * networkView.canvas.zoom + networkView.canvas.shiftX;
        }
    });
    Object.defineProperty(this, 'yt', {
        get: function () {
            return (10 + (networkView.canvas.height - 20) * neuron.y) * networkView.canvas.zoom + networkView.canvas.shiftY;
        }
    });
}