/*global EventHandlerList */

function Synapse(postNeuron) {
    'use strict';
    this.postNeuron = postNeuron;
    this.weight = 0.2 + 0.8 * Math.random();
    this.direction = Math.random() > 0.2 ? 1 : -1;
    this.activity = 0;
    this.onuseless = new EventHandlerList();
}

Synapse.prototype.reward = function (value) {
    'use strict';
    this.weight *= Math.exp(0.3 * value * this.activity);
    this.weight = Math.min(1, this.weight);
    if (this.weight < 0.15) {
        this.onuseless.fire({synapse: this});
    }
    this.activity = 0;
};

Synapse.prototype.stimulate = function (strength) {
    'use strict';
    this.activity += 1;
    this.postNeuron.stimulate(strength * this.weight * this.direction);
};