/*jslint browser: true */
/*global EventHandlerList, Neuron, randomSample */

function Network() {
    'use strict';
    this.neurons = new Set();
    this.input = new Map();
    this.onaddneuron = new EventHandlerList();
}

Network.prototype.addAction = function (f) {
    'use strict';
    this.addNeuron(null, f);
};

Network.prototype.addInput = function (id) {
    'use strict';
    this.addNeuron(id, null);
};

Network.prototype.addNeuron = function (inputID, action) {
    'use strict';
    var n = new Neuron();
    if (inputID) {
        this.input.set(inputID, n);
        n.flags.input = true;
    }
    if (action) {
        n.onfire.add(action);
        n.flags.action = true;
    }
    this.neurons.add(n);
    n.ondeletepostsynapse.add(function () {
        this.connectNeurons();
    }.bind(this));
    this.onaddneuron.fire({neuron: n});
    this.connectNeurons();
};

Network.prototype.connectNeurons = function () {
    'use strict';
    if (this.connectingNeurons || this.neurons.size < 100) { return; }
    this.connectingNeurons = true;
    setTimeout(function () {
        this.connectingNeurons = false;
        this.neurons.forEach(function (n) {
            while (n.postSynapses.size < 4) {
                n.connect(this);
            }
        }, this);
    }.bind(this), 500);
};

Network.prototype.reward = function (value) {
    'use strict';
    this.neurons.forEach(function (n) { n.reward(value); });
};

Network.prototype.stimulate = function (id) {
    'use strict';
    this.input.get(id).stimulate(1);
};