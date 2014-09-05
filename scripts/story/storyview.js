function EventView(id, newness, visual) {
  'use strict';
  this.id = id;
  this.newness = newness;
  this.visual = visual;
}

EventView.prototype.draw = function (context) {
  'use strict';
  this.visual.draw(context, -100000 * this.newness, 10 * this.id, 10);
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
  var context = this.canvas.getContext('2d');
  context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.eventViews.forEach(function (e) { e.draw(context); });
};
