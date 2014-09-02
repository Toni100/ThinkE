/*global EventHandlerList, makeCounter, Worker */

function Neuron(id, network) {
    'use strict';
    this.id = id;
    this.network = network;
    this.x = Math.random();
    this.y = Math.random();
    this.onfire = new EventHandlerList();
    this.onstimulate = new EventHandlerList();
}

Neuron.prototype.stimulate = function (strength) {
    'use strict';
    this.network.think.postMessage({stimulate: {id: this.id, strength: strength}});
    this.onstimulate.fire({strength: strength});
};

function Network() {
    'use strict';
    this.neurons = new Map();
    this.queries = new Map();
    this.makeID = makeCounter();
    this.think = new Worker('scripts/network/think.js');
    this.think.onmessage = function (event) {
        if (event.data.addsynapse) {
            this.onaddsynapse.fire({synapse: event.data.addsynapse});
        }
        if (event.data.deletesynapse) {
            this.ondeletesynapse.fire({synapse: event.data.deletesynapse});
        }
        if (event.data.fireneuron) {
            this.onfireneuron.fire(event.data.fireneuron);
            this.neurons.get(event.data.fireneuron.id).onfire.fire({strength: event.data.fireneuron.strength});
        }
        if (event.data.weights) {
            this.onchangeweights.fire({weights: event.data.weights});
        }
        if (event.data.synapses) {
            this.queries.get(event.data.synapses.id)(event.data.synapses.value);
            this.queries.delete(event.data.synapses.id);
        }
    }.bind(this);
    this.onaddneuron = new EventHandlerList();
    this.onaddsynapse = new EventHandlerList();
    this.ondeletesynapse = new EventHandlerList();
    this.onchangeweights = new EventHandlerList();
    this.onfireneuron = new EventHandlerList();
}

Network.prototype.addAction = function (f) {
    'use strict';
    this.addNeuron().onfire.add(f);
};

Network.prototype.addNeuron = function () {
    'use strict';
    var n = new Neuron(this.makeID(), this);
    this.neurons.set(n.id, n);
    this.think.postMessage({addneuron: {id: n.id, x: n.x, y: n.y}});
    this.onaddneuron.fire({neuron: n});
    return n;
};

Network.prototype.getSynapses = function (callback) {
    'use strict';
    var id = this.makeID();
    this.queries.set(id, callback);
    this.think.postMessage({getsynapses: {id: id}});
};

Network.prototype.reward = function (value) {
    'use strict';
    this.think.postMessage({reward: {value: value}});
};
