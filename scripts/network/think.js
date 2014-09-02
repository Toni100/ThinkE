/*jslint browser: true */
/*global self, EventHandlerList, randomChoice, randomSample */

self.importScripts('../utilities/eventhandlerlist.js', '../utilities/random.js');

var neurons = new Map(),
    connectingNeurons,
    postingWeights;

function connectNeurons() {
    'use strict';
    if (connectingNeurons || neurons.size < 100) { return; }
    connectingNeurons = true;
    setTimeout(function () {
        connectingNeurons = false;
        neurons.forEach(function (n) {
            while (n.postSynapses.size < 4) { n.connect(); }
        });
    }, 1000);
}

function getSynapses(id) {
    'use strict';
    var synapses = [];
    neurons.forEach(function (n) {
        n.postSynapses.forEach(function (s) {
            synapses.push({
                id: s.id,
                n1id: n.id,
                n2id: s.postNeuron.id,
                weight: s.weight,
                direction: s.direction
            });
        });
    });
    self.postMessage({synapses: {id: id, value: synapses}});
}

function postWeights() {
    'use strict';
    if (postingWeights) { return; }
    postingWeights = true;
    setTimeout(function () {
        postingWeights = false;
        var weights = [];
        neurons.forEach(function (n) {
            n.postSynapses.forEach(function (ps) {
                weights.push({n1id: n.id, n2id: ps.postNeuron.id, weight: ps.weight});
            });
        });
        self.postMessage({weights: weights});
    }, 1500);
}

function reward(value) {
    'use strict';
    neurons.forEach(function (n) {
        n.postSynapses.forEach(function (ps) {
            ps.reward(value);
        });
    });
}

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
    if (!this.activity) { return; }
    this.weight *= Math.exp(0.2 * value * Math.min(this.activity, 5));
    this.weight = Math.min(1, this.weight);
    postWeights();
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

function Neuron(id, x, y) {
    'use strict';
    this.id = id;
    this.x = x;
    this.y = y;
    this.potential = 0.6;
    this.postSynapses = new Map();
}

Neuron.prototype.connect = function () {
    'use strict';
    if (!neurons.size) { return; }
    var candidates = [],
        n,
        s;
    neurons.forEach(function (n) {
        if (n !== this) { candidates.push(n); }
    }, this);
    this.postSynapses.forEach(function (s) {
        candidates.splice(candidates.indexOf(s.postNeuron), 1);
    });
    n = randomChoice(candidates);
    randomSample(candidates, neurons.size / 20).forEach(function (c) {
        if (c.distance(this) < n.distance(this)) { n = c; }
    }, this);
    s = new Synapse(n);
    s.onuseless.add(function (event) {
        this.postSynapses.delete(event.data.synapse.postNeuron.id);
        self.postMessage({deletesynapse: {n1id: this.id, n2id: event.data.synapse.postNeuron.id}});
        connectNeurons();
    }.bind(this));
    this.postSynapses.set(n.id, s);
    self.postMessage({addsynapse: {n1id: this.id, n2id: n.id, weight: s.weight, direction: s.direction}});
};

Neuron.prototype.distance = function (other) {
    'use strict';
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
};

Neuron.prototype.stimulate = function (strength) {
    'use strict';
    this.potential = Math.min(2, Math.max(0, this.potential + strength));
    if (this.charging || this.potential < 1) { return; }
    this.charging = true;
    var s = this.potential / 2;
    this.potential = 0;
    this.postSynapses.forEach(function (ps) { ps.stimulate(s); });
    self.postMessage({fireneuron: {id: this.id, strength: s}});
    setTimeout(function () {
        this.charging = false;
        this.stimulate(0);
    }.bind(this), 100);
};

self.onmessage = function (event) {
    'use strict';
    if (event.data.addneuron) {
        neurons.set(
            event.data.addneuron.id,
            new Neuron(event.data.addneuron.id, event.data.addneuron.x, event.data.addneuron.y)
        );
        connectNeurons();
    }
    if (event.data.stimulate) {
        neurons.get(event.data.stimulate.id).stimulate(event.data.stimulate.strength);
    }
    if (event.data.reward) {
        reward(event.data.reward.value);
    }
    if (event.data.getsynapses) {
        getSynapses(event.data.getsynapses.id);
    }
};
