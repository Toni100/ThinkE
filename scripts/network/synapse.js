function Synapse(postNeuron) {
    'use strict';
    this.postNeuron = postNeuron;
    this.weight = 0.2 + 0.8 * Math.random();
    this.direction = Math.random() > 0.2 ? 1 : -1;
}

Synapse.prototype.stimulate = function (strength) {
    'use strict';
    this.postNeuron.stimulate(strength * this.weight * this.direction);
};