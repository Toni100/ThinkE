function EventView(id, newness, visual) {
  'use strict';
  this.id = id;
  this.newness = newness;
  this.visual = visual;
}

EventView.prototype.draw = function (context, width, position, zoom, shiftY) {
  'use strict';
  var size = Math.max(10, 10 * zoom),
    a = 10 * (1 - this.newness) / Math.pow(zoom, 1 / 4);
  this.visual.draw(
    context,
    size / 2 + (width - size) / 2 * (a < 1 ? Math.pow(a, 2) : 2 - Math.pow(2 - Math.min(2, a), 2)),
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
  if (this.drawing) { return; }
  this.drawing = true;
  requestAnimationFrame(function () {
    this.drawing = false;
    var context = this.canvas.getContext('2d'),
      l = this.eventViews.length,
      w = this.canvas.width,
      min = Math.max(0, Math.floor(l - (this.canvas.height - this.canvas.shiftY) / (12 * this.canvas.zoom))),
      max = Math.min(l - 1, Math.ceil(this.canvas.shiftY / (12 * this.canvas.zoom) + l)),
      i;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (i = min; i <= max; i += 1) {
      this.eventViews[i].draw(context, w, l - i, this.canvas.zoom, this.canvas.shiftY);
    }
  }.bind(this));
};
