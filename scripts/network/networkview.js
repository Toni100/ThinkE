/*jslint browser: true */
/*global NeuronView, randomSample, requestAnimationFrame, SynapseView, zoomify */

function NetworkView(network, canvas) {
    'use strict';
    this.neurons = new Map();
    this.reducedNeurons = [];
    this.canvas = zoomify(canvas, function () {
        this.draw();
        this.updateReducedView(60);
    }.bind(this));
    network.neurons.forEach(function (n) {
        this.neurons.set(n.id, new NeuronView(n, this));
    }, this);
    network.onaddneuron.add(function (event) {
        this.neurons.set(event.data.neuron.id, new NeuronView(event.data.neuron, this));
        this.updateReducedView();
    }.bind(this));
    network.onaddsynapse.add(function (event) {
        this.neurons.get(event.data.n1id).postSynapses.set(
            event.data.n2id,
            new SynapseView(this.neurons.get(event.data.n2id), event.data.weight, event.data.direction)
        );
        this.drawDelayed();
    }.bind(this));
    network.ondeletesynapse.add(function (event) {
        this.neurons.get(event.data.n1id).postSynapses.delete(event.data.n2id);
        this.drawDelayed();
    }.bind(this));
    network.onchangeweights.add(function (event) {
        event.data.weights.forEach(function (s) {
            this.neurons.get(s.n1id).postSynapses.get(s.n2id).weight = s.weight;
        }, this);
        this.drawDelayed();
    }.bind(this));
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
        this.reducedNeurons.forEach(function (n) {
            n.postSynapses.forEach(function (s) {
                context.beginPath();
                context.strokeStyle = s.color;
                context.moveTo(n.xt, n.yt);
                context.lineTo(s.postNeuron.xt, s.postNeuron.yt);
                context.stroke();
            });
        });

        // neurons
        this.reducedNeurons.forEach(function (n) {
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

NetworkView.prototype.updateReducedView = function (delay) {
    'use strict';
    if (this.updatingReducedView) { return; }
    this.updatingReducedView = true;
    setTimeout(function () {
        this.updatingReducedView = false;
        this.reducedNeurons = [];
        this.neurons.forEach(function (n) {
            if (n.visible) { this.reducedNeurons.push(n); }
        }, this);
        this.reducedNeurons = randomSample(this.reducedNeurons, 300);
        this.drawDelayed();
    }.bind(this), typeof delay === 'number' ? delay : 1800);
};