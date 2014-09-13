/*jslint browser: true */
/*global randomSample, requestAnimationFrame, zoomify */

function SynapseView(postNeuron, weight, direction) {
    'use strict';
    this.postNeuron = postNeuron;
    this.weight = weight;
    this.direction = direction;
    Object.defineProperty(this, 'color', {
        get: function () {
            if (this.direction < 0) {
                return 'rgba(' +
                    Math.round(80 + 130 * (this.weight + 1) / 2) + ', ' +
                    Math.round(40 + 20 * (this.weight + 1) / 2) + ', ' +
                    Math.round(80 + 40 * (this.weight + 1) / 2) + ', 0.5)';
            }
            return 'rgba(' +
                Math.round(230 * (this.weight + 1) / 2) + ', ' +
                Math.round(230 * (this.weight + 1) / 2) + ', ' +
                Math.round(230 * (this.weight + 1) / 2) + ', 0.5)';
        }
    });
}

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
    Object.defineProperty(this, 'visible', {
        get: function () {
            return 0 < this.xt && this.xt < networkView.canvas.width &&
                0 < this.yt && this.yt < networkView.canvas.height;
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
    neuron.onstimulate.add(function (event) {
        this.wasStimulated = true;
        this.lastStimulationStrength = event.data.strength;
        networkView.drawDelayed(1000);
    }.bind(this));
}

function NetworkView(canvas, network) {
    'use strict';
    this.neurons = new Map();
    this.reducedNeurons = [];
    var n = null,
        addSynapse = function (s) {
            this.neurons.get(s.n1id).postSynapses.set(
                s.n2id,
                new SynapseView(this.neurons.get(s.n2id), s.weight, s.direction)
            );
        }.bind(this),
        handleOnaddneuron = function (event) {
            this.neurons.set(event.data.neuron.id, new NeuronView(event.data.neuron, this));
            this.updateReducedView();
        }.bind(this),
        handleOnaddsynapse = function (event) {
            addSynapse(event.data.synapse);
            this.drawDelayed();
        }.bind(this),
        handleOndeletesynapse = function (event) {
            this.neurons.get(event.data.synapse.n1id).postSynapses.delete(event.data.synapse.n2id);
            this.drawDelayed();
        }.bind(this),
        handleOnchangeweights = function (event) {
            event.data.weights.forEach(function (s) {
                this.neurons.get(s.n1id).postSynapses.get(s.n2id).weight = s.weight;
            }, this);
            this.drawDelayed();
        }.bind(this),
        handleOnfireneuron = function (event) {
            var n = this.neurons.get(event.data.id);
            n.hasFired = true;
            n.lastFireStrength = event.data.strength;
            this.drawDelayed(1000);
        }.bind(this);
    Object.defineProperty(this, 'network', {
        get: function () {
            return n;
        },
        set: function (network) {
            this.neurons.clear();
            this.reducedNeurons = [];
            if (n) {
                n.onaddneuron.delete(handleOnaddneuron);
                n.onaddsynapse.delete(handleOnaddsynapse);
                n.ondeletesynapse.delete(handleOndeletesynapse);
                n.onchangeweights.delete(handleOnchangeweights);
                n.onfireneuron.delete(handleOnfireneuron);
            }
            n = network;
            if (n) {
                n.onaddneuron.add(handleOnaddneuron);
                n.onaddsynapse.add(handleOnaddsynapse);
                n.ondeletesynapse.add(handleOndeletesynapse);
                n.onchangeweights.add(handleOnchangeweights);
                n.onfireneuron.add(handleOnfireneuron);
                n.neurons.forEach(function (n) {
                    this.neurons.set(n.id, new NeuronView(n, this));
                }, this);
                n.getSynapses(function (synapses) {
                    synapses.forEach(addSynapse);
                });
                this.updateReducedView(60);
            }
        }
    });
    this.canvas = zoomify(canvas, function () {
        this.draw();
        this.updateReducedView(60);
    }.bind(this));
    if (network) {
        this.network = network;
    }
}

NetworkView.prototype.draw = function () {
    'use strict';
    if (this.drawing) { return; }
    this.drawing = true;
    requestAnimationFrame(function () {
        this.drawing = false;
        var context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.reducedNeurons.forEach(function (n) {
            n.postSynapses.forEach(function (s) {
                context.beginPath();
                context.strokeStyle = s.color;
                context.moveTo(n.xt, n.yt);
                context.lineTo(s.postNeuron.xt, s.postNeuron.yt);
                context.stroke();
            });
        });
        this.reducedNeurons.forEach(function (n) {
            context.fillStyle = n.color;
            context.fillRect(n.xt - 2, n.yt - 2, 4, 4);
        });
        this.reducedNeurons.forEach(function (n) {
            if (n.wasStimulated) {
                context.beginPath();
                if (n.lastStimulationStrength > 0) {
                    context.fillStyle = 'rgba(100, 250, 180, 0.7)';
                } else {
                    context.fillStyle = 'rgba(250, 100, 180, 0.7)';
                }
                context.arc(n.xt, n.yt, 3, 0, n.lastStimulationStrength * 2 * Math.PI, false);
                context.fill();
                context.beginPath();
                context.strokeStyle = 'rgb(0, 150, 180)';
                context.arc(n.xt, n.yt, 4, 0, 2 * Math.PI, false);
                context.stroke();
                n.wasStimulated = false;
                this.drawDelayed();
            }
        }, this);
        context.fillStyle = 'rgba(50, 200, 255, 0.5)';
        context.strokeStyle = 'rgba(50, 200, 255, 0.5)';
        context.beginPath();
        this.reducedNeurons.forEach(function (n) {
            if (n.hasFired) {
                context.fillRect(n.xt - 2, n.yt - 2, 4, 4);
                n.postSynapses.forEach(function (s) {
                    context.moveTo(n.xt, n.yt);
                    context.lineTo(s.postNeuron.xt, s.postNeuron.yt);
                });
                n.hasFired = false;
            }
            this.drawDelayed();
        }, this);
        context.stroke();
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
        this.reducedNeurons = randomSample(this.reducedNeurons, 200);
        this.drawDelayed();
    }.bind(this), typeof delay === 'number' ? delay : 1800);
};
