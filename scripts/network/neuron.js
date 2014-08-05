/*jslint browser: true */
/*global EventHandlerList */

function Neuron() {
    'use strict';
    this.postSynapses = new Set();
    this.potential = 0;
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

Neuron.prototype.integrate = function (network, npost, npre) {
    'use strict';
    var pre = randomSample(network.neurons, npost + npre),
        post = pre.splice(0, npost);
    post.forEach(function (p) {
        this.postSynapses.add(new Synapse(p));
    }, this);
    network.neurons.add(this);
    network.onaddneuron.fire({neuron: this});
    pre.forEach(function (p) {
        p.addPostNeuron(p);
    }, this);
};

Neuron.prototype.stimulate = function (s) {
    'use strict';
    this.potential = Math.min(2, Math.max(-2, this.potential + s));
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