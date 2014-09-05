function Event(id, newness) {
  'use strict';
  Object.defineProperty(this, 'id', {get: function () { return id; }});
  Object.defineProperty(this, 'newness', {get: function () { return newness; }});
}

function Story() {
  'use strict';
  this.events = [];
  this.onaddevent = new EventHandlerList();
}

Story.prototype.add = function (id, newness, visual) {
  'use strict';
  var e = new Event(id, newness);
  this.events.push(e);
  this.onaddevent.fire({event: e, visual: visual});
};
