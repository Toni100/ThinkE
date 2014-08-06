/*jslint browser: true */
/*global EventHandlerList, Synapse, randomChoice, randomSample */

function Neuron() {
    'use strict';
    this.postSynapses = new Set();
    this.potential = 0.6;
    this.x = Math.random();
    this.y = Math.random();
    this.flags = {};
    this.onfire = new EventHandlerList();
    this.onaddpostsynapse = new EventHandlerList();
    this.onfire.add(function (event) {
        this.postSynapses.forEach(function (s) {
            s.stimulate(event.data.strength);
        }, this);
    }.bind(this));
}

Neuron.prototype.addPostNeuron = function (neuron) {
    'use strict';
    var s = new Synapse(neuron);
    this.postSynapses.add(s);
    this.onaddpostsynapse.fire({synapse: s});
};

Neuron.prototype.connect = function (network) {
    'use strict';
    if (!network.neurons.size) { return; }
    var candidates = new Set(network.neurons),
        n;
    candidates.delete(this);
    this.postSynapses.forEach(function (s) {
        candidates.delete(s.postNeuron);
    });
    n = randomChoice(candidates);
    randomSample(candidates, 15).forEach(function (c) {
        if (c.distance(this) < n.distance(this)) {
            n = c;
        }
    }, this);
    this.addPostNeuron(n);
};

Neuron.prototype.distance = function (other) {
    'use strict';
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
};

Neuron.prototype.stimulate = function (s) {
    'use strict';
    this.potential = Math.min(2, Math.max(0, this.potential + s));
    if (this.charging || this.potential < 1) { return; }
    this.charging = true;
    var strength = this.potential / 2;
    this.potential = 0;
    this.onfire.fire({strength: strength});
    setTimeout(function () {
        this.charging = false;
        this.stimulate(0);
    }.bind(this), 400);
};