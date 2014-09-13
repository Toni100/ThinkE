/*global Cache, CacheList, canvasResize, HTMLCanvasElement, Image */

function Visual(data, queue) {
  'use strict';
  if (data instanceof Cache) {
    this.cache = new CacheList(function (size, finish) {
      data.promise.then(function (img) {
        if (size > 1000) {
          finish(img);
        } else if (queue) {
          queue.prepend(function (done) {
            canvasResize(img, size, finish);
            done();
          });
        } else {
          canvasResize(img, size, finish);
        }
      });
    }, function (size) {
      if (size === 100) { return this.cache.get(10).result; }
      if (size === 1000) { return this.cache.get(100).result; }
      return data.result;
    }.bind(this));
  } else if (data instanceof HTMLCanvasElement || data instanceof Image) {
    this.cache = new CacheList(function (size, finish) {
      canvasResize(data, size, finish);
    });
  } else {
    this.cache = data;
  }
}

Visual.prototype.draw = function (context, x, y, size) {
  'use strict';
  var v = this.get(size),
    w,
    h;
  if (v instanceof HTMLCanvasElement || v instanceof Image) {
    w = v.width;
    h = v.height;
    [w, h] = w > h ? [size, size * h / w] : [size * w / h, size];
    context.drawImage(v, x - w / 2, y - h / 2, w, h);
  } else if (typeof v === 'string' || typeof v === 'number') {
    context.fillStyle = 'black';
    context.fillText(v, x, y);
  } else {
    context.fillStyle = 'gray';
    context.fillRect(x - 2, y - 2, 4, 4);
  }
};

Visual.prototype.get = function (size) {
  'use strict';
  if (!(this.cache instanceof CacheList)) {
    return size < 10 ? null : this.cache;
  }
  if (size <= 10) { return this.cache.get(10).result; }
  if (size <= 100) { return this.cache.get(100).result; }
  if (size <= 1000) { return this.cache.get(1000).result; }
  return this.cache.get(10000).result;
};
