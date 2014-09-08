function Cache(f, input, fallback) {
  'use strict';
  var finished = false,
    running = false,
    promise,
    cached;
  function compute() {
    running = true;
    promise = new Promise(function (resolve) {
      f(input, function (result) {
        cached = result;
        finished = true;
        resolve(result);
      });
    });
  }
  Object.defineProperty(this, 'result', {
    get: function () {
      if (finished) { return cached; }
      if (running) { return fallback(input); }
      compute();
      if (finished) { return cached; } // when f is synchronous
      return fallback(input);  // when f is asynchronous
    }
  });
  Object.defineProperty(this, 'promise', {
    get: function () {
      if (finished) { return Promise.resolve(cached); }
      if (running) { return Promise.race([promise]); }
      compute();
      return Promise.race([promise]);
    }
  });
}

function CacheList(f, fallback) {
  'use strict';
  this.f = f;
  this.fallback = fallback || function (input) { return input; };
  this.map = new Map();
}

CacheList.prototype.get = function (input) {
  'use strict';
  var cache = this.map.get(input);
  if (!cache) {
    cache = new Cache(this.f, input, this.fallback);
    this.map.set(input, cache);
  }
  return cache;
};


// result, synchronous

// var c = new CacheList(
//   function (input, finish) {
//     console.log('computing');
//     finish(input * input);
//   },
//   function (input) { return input + 777; }
// );
// console.log(c.get(3).result); // logs 'computing', then 9
// console.log(c.get(3).result); // logs 9


// result, asynchronous

// var c = new CacheList(
//   function (input, finish) {
//     console.log('computing');
//     setTimeout(function () {
//       finish(Math.pow(input, 4));
//     }, 200);
//   },
//   function (input) { return input + 777; }
// );
// console.log(c.get(3).result); // logs 'computing', then 780
// setTimeout(function () {
//   console.log(c.get(3).result); // logs 780
// }, 100);
// setTimeout(function () {
//   console.log(c.get(3).result); // logs 81
// }, 300);


// promise, synchronous

// var c = new CacheList(
//   function (input, finish) {
//     console.log('computing');
//     finish(input * input);
//   },
//   function (input) { return input + 777; }
// );
// c.get(3).promise.then(function (result) {
//   console.log(result); // logs 'computing', then 9
// });
// c.get(3).promise.then(function (result) {
//   console.log(result); // logs 9
// });


// promise, asynchronous 1

// var c = new CacheList(
//   function (input, finish) {
//     console.log('computing');
//     setTimeout(function () {
//       finish(Math.pow(input, 4));
//     }, 200);
//   },
//   function (input) { return input + 777; }
// );
// c.get(3).promise.then(function (result) {
//   console.log(result); // logs 81
// });
// c.get(3).promise.then(function (result) {
//   console.log(result); // logs 81
// });


// promise, asynchronous 2

// var c = new CacheList(
//   function (input, finish) {
//     console.log('computing');
//     setTimeout(function () {
//       finish(Math.pow(input, 4));
//     }, 200);
//   },
//   function (input) { return input + 777; }
// );
// console.log(c.get(3).result); // logs 780
// c.get(3).promise.then(function (result) {
//   console.log(result); // logs 81
// });
// c.get(3).promise.then(function (result) {
//   console.log(result); // logs 81
// });
