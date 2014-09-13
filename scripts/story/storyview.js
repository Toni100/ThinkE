function EventView(id, newness, visual) {
  'use strict';
  this.id = id;
  this.newness = newness;
  this.visual = visual;
}

EventView.prototype.draw = function (context, position, zoom, shiftY) {
  'use strict';
  var size = Math.max(10, 10 * zoom);
  this.visual.draw(
    context,
    2 + size / 2 + 100 * (1 - this.newness) / zoom,
    12 * position * zoom + shiftY,
    size
  );
};

function StoryView(canvas, story) {
  'use strict';
  this.eventViews = [];
  this.canvas = zoomify(canvas, function () {
    this.draw();
  }.bind(this));
  story.onaddevent.add(function (event) {
    this.eventViews.push(new EventView(event.data.event.id, event.data.event.newness, event.data.visual));
    this.draw();
  }.bind(this));
}

StoryView.prototype.draw = function () {
  'use strict';
  var context = this.canvas.getContext('2d'),
    l = this.eventViews.length;
  context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.eventViews.forEach(function (e, i) {
    e.draw(context, l - i, this.canvas.zoom, this.canvas.shiftY);
  }, this);
};
