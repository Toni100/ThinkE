function Synapse(postNeuron) {
    'use strict';
    this.postNeuron = postNeuron;
    this.weight = 2 * Math.random() - 1;
}

Synapse.prototype.stimulate = function (w) {
    'use strict';
    this.postNeuron.stimulate(w * this.weight);
};