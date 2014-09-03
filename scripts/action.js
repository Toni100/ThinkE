/*jslint browser: true */

function makeImageAction(network, canvas) {
    'use strict';
    var context = canvas.getContext('2d'),
        image = [],
        w = 6,
        h = 6,
        i,
        drawing = false;
    function draw() {
        if (drawing) { return; }
        drawing = true;
        setTimeout(function () {
            drawing = false;
            var x, y;
            for (y = 0; y < h; y += 1) {
                for (x = 0; x < w; x += 1) {
                    context.fillStyle = 'rgb(' + image[(y * w + x) * 3] + ', ' + image[(y * w + x) * 3 + 1] + ', ' + image[(y * w + x) * 3 + 2] + ')';
                    context.fillRect(x * canvas.width / w, y * canvas.height / h, canvas.width / w, canvas.height / h);
                }
            }
        }, 20);
    }
    for (i = 0; i < w * h * 3; i += 1) {
        image.push(255);
        (function (i) {
            network.addAction(function (event) {
                image[i] = Math.round(255 * event.data.strength);
                draw();
            });
        }(i));
    }
}
