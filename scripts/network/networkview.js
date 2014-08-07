/*jslint browser: true */
/*global NeuronView, zoomify, requestAnimationFrame */

function NetworkView(network, canvas) {
    'use strict';
    this.canvas = zoomify(canvas, this.draw.bind(this));
    this.neurons = new Map();
    network.neurons.forEach(function (n) {
        this.neurons.set(n, new NeuronView(n, this));
    }, this);
    network.onaddneuron.add(function (event) {
        this.neurons.set(event.data.neuron, new NeuronView(event.data.neuron, this));
        this.drawDelayed();
    }.bind(this));
    network.onreward.add(this.drawDelayed.bind(this));
    this.draw();
}

NetworkView.prototype.draw = function () {
    'use strict';
    if (this.drawing) { return; }
    this.drawing = true;
    requestAnimationFrame(function () {
        this.drawing = false;
        var context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // synapses
        this.neurons.forEach(function (n) {
            n.postSynapses.forEach(function (s) {
                context.beginPath();
                context.strokeStyle = s.color;
                context.moveTo(n.xt, n.yt);
                context.lineTo(s.postNeuron.xt, s.postNeuron.yt);
                context.stroke();
            });
        });

        // neurons
        this.neurons.forEach(function (n) {
            context.fillStyle = n.color;
            context.fillRect(n.xt - 2, n.yt - 2, 4, 4);
        });
    }.bind(this));
};

NetworkView.prototype.drawDelayed = function () {
    'use strict';
    if (this.drawingDelayed) { return; }
    this.drawingDelayed = true;
    setTimeout(function () {
        this.drawingDelayed = false;
        this.draw();
    }.bind(this), 1000);
};