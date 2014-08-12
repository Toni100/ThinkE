/*jslint browser: true */
/*global Graph, Network, GraphView, NetworkView */

var graph = new Graph(),
    network = new Network(),
    graphView = new GraphView(graph, document.getElementById('graph')),
    networkView = new NetworkView(network, document.getElementById('network')),
    i;

for (i = 0; i < 200; i += 1) {
    network.addNeuron();
}

// connect graph to network
graph.onaddtrigger.add(function (event) {
    'use strict';
    network.addInput(event.data.id);
});
graph.onvertexconnected.add(function (event) {
    'use strict';
    graph.nearestTriggers(event.data.id, 2).forEach(function (id) {
        network.stimulate(id);
    });
});

// actions
makeTextAction(network, document.getElementById('textAction'));
makeImageAction(network, document.getElementById('imageAction'));

// graph fullscreen
function resizeGraph() {
    'use strict';
    document.getElementById('graph').width = window.innerWidth;
    document.getElementById('graph').height = window.innerHeight;
    graphView.draw();
}
window.addEventListener('resize', resizeGraph);
resizeGraph();

// input
makeVideoInput(graph.add.bind(graph));
document.getElementById('fileInput').onchange = function () {
    'use strict';
    var i;
    for (i = 0; i < this.files.length; i += 1) {
        if (this.files[i].type.match(/image\/*/)) {
            graph.add(this.files[i]);
        }
    }
};
document.getElementById('textInput').onkeypress = function (event) {
    'use strict';
    if (event.keyCode === 13 && this.value) {
        graph.add(this.value);
        this.value = '';
    }
};

// vertex count
function setVertexCount() {
    'use strict';
    document.getElementById('vertexCount').textContent = graph.vertices.size;
}
graph.onaddvertex.add(setVertexCount);
graph.ondeletevertex.add(setVertexCount);

// context
(function () {
    'use strict';
    var canvas = document.getElementById('context'),
        last = 0,
        running = false;
    function showContext() {
        running = false;
        if (!graph.vertices.has(last)) { return; }
        graphView.filter(
            graph.nearest(last, 1),
            canvas
        ).layout.postMessage({fixvertex: {id: last, x: canvas.width / 2, y: canvas.height / 2}});
    }
    graph.onvertexconnected.add(function (event) {
        last = event.data.id;
        if (running) { return; }
        running = true;
        setTimeout(showContext, 1500);
    });
}());


// for (i = 1; i <= 100; i += 1) {
//     graph.add(Math.round(Math.random() * 1000000));
// }

// setInterval(function () {
//     network.reward(-1 + 2 * Math.random());
// }, 1000);