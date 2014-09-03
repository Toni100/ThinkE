/*jslint browser: true*/

function imageResize(img, size, callback) {
    'use strict';
    var canvas,
        resizedImg,
        w = img.width,
        h = img.height;
    if (w <= size && h <= size) {
        callback(img);
        return;
    }
    if (w > h) {
        [w, h] = [size, size * h / w];
    } else {
        [w, h] = [size * w / h, size];
    }
    canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    resizedImg = document.createElement('img');
    resizedImg.onload = function () {
        callback(this);
    };
    resizedImg.src = canvas.toDataURL();
}

function imageToArrayBuffer(img, w, h) {
    'use strict';
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    context.drawImage(img, 0, 0, w, h);
    return context.getImageData(0, 0, w, h).data.buffer;
}
