/*jslint browser: true */

function makeVideoInput(add) {
    'use strict';
    var recording = false,
        canvas = document.createElement('canvas'),
        input = document.getElementById('videoInputButton'),
        video = document.getElementById('videoInput');
    function recordFrame() {
        if (!recording) { return; }
        if (!video.videoWidth) {
            setTimeout(recordFrame, 100);
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        var img = document.createElement('img');
        img.onload = function () {
            add(img);
        };
        img.src = canvas.toDataURL('image/png');
        setTimeout(recordFrame, 500);
    }
    function startRecording() {
        navigator.mozGetUserMedia({video: true}, function (stream) {
            recording = true;
            video.mozSrcObject = stream;
            input.innerHTML = 'stop';
            input.onclick = stopRecording;
            recordFrame();
        }, function () { return; });
    }
    function stopRecording() {
        recording = false;
        video.mozSrcObject = null;
        input.innerHTML = 'video';
        input.onclick = startRecording;
    }
    input.onclick = startRecording;
}
