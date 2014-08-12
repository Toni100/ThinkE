/*global EventHandlerList */

function Neuron(id) {
    'use strict';
    this.id = id;
    this.x = Math.random();
    this.y = Math.random();
    this.onfire = new EventHandlerList();
}