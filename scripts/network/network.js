/*global EventHandlerList, Neuron, randomSample */

function Network() {
    'use strict';
    this.neurons = new Set();
    this.input = new Map();
    this.onaddneuron = new EventHandlerList();
}

Network.prototype.addAction = function (f) {
    'use strict';
    var n = new Neuron();
    n.onfire.add(f);
    n.flags.action = true;
    n.integrate(this, 15, 15);
};

Network.prototype.addInput = function (id) {
    'use strict';
    var n = new Neuron();
    this.input.set(id, n);
    n.flags.input = true;
    n.integrate(this, 15, 0);
};

Network.prototype.addNeuron = function () {
    'use strict';
    new Neuron().integrate(this, 15, 15);
};

Network.prototype.stimulate = function (id) {
    'use strict';
    this.input.get(id).stimulate(1);
};