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