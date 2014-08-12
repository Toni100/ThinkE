/*global EventHandlerList, makeCounter, Neuron, Worker */

function Network() {
    'use strict';
    this.neurons = new Map();
    this.makeID = makeCounter();
    this.input = new Map();
    this.think = new Worker('scripts/network/think.js');
    this.think.onmessage = function (event) {
        if (event.data.addsynapse) {
            this.onaddsynapse.fire({
                n1id: event.data.addsynapse.n1id,
                n2id: event.data.addsynapse.n2id,
                weight: event.data.addsynapse.weight,
                direction: event.data.addsynapse.direction
            });
        }
        if (event.data.deletesynapse) {
            this.ondeletesynapse.fire({
                n1id: event.data.deletesynapse.n1id,
                n2id: event.data.deletesynapse.n2id
            });
        }
        if (event.data.fire) {
            this.neurons.get(event.data.fire.id).onfire.fire({strength: event.data.fire.strength});
        }
        if (event.data.weights) {
            this.onchangeweights.fire({weights: event.data.weights});
        }
    }.bind(this);
    this.onaddneuron = new EventHandlerList();
    this.onaddsynapse = new EventHandlerList();
    this.ondeletesynapse = new EventHandlerList();
    this.onchangeweights = new EventHandlerList();
}

Network.prototype.addAction = function (f) {
    'use strict';
    this.addNeuron().onfire.add(f);
};

Network.prototype.addInput = function (inputID) {
    'use strict';
    var n = this.addNeuron();
    n.inputID = inputID;
    this.input.set(inputID, n);
};

Network.prototype.addNeuron = function () {
    'use strict';
    var n = new Neuron(this.makeID());
    this.neurons.set(n.id, n);
    this.think.postMessage({addneuron: {id: n.id, x: n.x, y: n.y}});
    this.onaddneuron.fire({neuron: n});
    return n;
};

Network.prototype.reward = function (value) {
    'use strict';
    this.think.postMessage({reward: {value: value}});
};

Network.prototype.stimulate = function (inputID) {
    'use strict';
    this.think.postMessage({stimulate: {id: this.input.get(inputID).id, strength: 1}});
};