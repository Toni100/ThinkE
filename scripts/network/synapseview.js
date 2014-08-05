function SynapseView(synapse, networkView) {
    'use strict';
    this.postNeuron = networkView.neurons.get(synapse.postNeuron);
    Object.defineProperty(this, 'color', {
        get: function () {
            return 'rgba(' +
                Math.round(255 * (synapse.weight + 1) / 2) + ', ' +
                Math.round(255 * (synapse.weight + 1) / 2) + ', ' +
                Math.round(255 * (synapse.weight + 1) / 2) + ', 0.5)';
        }
    });
}