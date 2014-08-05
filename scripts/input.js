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
        recording = true;
        input.innerHTML = 'pause recording';
        input.onclick = pauseRecording;
        recordFrame();
    }
    function pauseRecording() {
        recording = false;
        input.innerHTML = 'continue recording';
        input.onclick = startRecording;
    }
    input.onclick = function () {
        navigator.mozGetUserMedia({video: true}, function (stream) {
            video.mozSrcObject = stream;
            startRecording();
        }, function () { return; });
    };
}