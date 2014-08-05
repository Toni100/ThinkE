function NeuronView(neuron, networkView) {
    'use strict';
    this.postSynapses = [];
    neuron.postSynapses.forEach(function (s) {
        this.postSynapses.push(new SynapseView(s, networkView));
    }, this);
    this.x = 10 + (networkView.canvas.width - 20) * Math.random();
    this.y = 10 + (networkView.canvas.height - 20) * Math.random();
    if (neuron.flags.action) {
        this.color = 'rgb(0, 255, 255)';
    } else if (neuron.flags.input) {
        this.color = 'red';
    } else {
        this.color = 'rgb(255, 210, 130)';
    }
    neuron.onaddpostsynapse.add(function (event) {
        this.postSynapses.push(new SynapseView(event.data.synapse, networkView));
    }.bind(this));
    Object.defineProperty(this, 'xt', {
        get: function () {
            return this.x * networkView.canvas.zoom + networkView.canvas.shiftX;
        }
    });
    Object.defineProperty(this, 'yt', {
        get: function () {
            return this.y * networkView.canvas.zoom + networkView.canvas.shiftY;
        }
    });
}