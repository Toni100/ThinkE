/*jslint browser: true */
/*global Graph, GraphView, Network, NetworkView, Queue, TextAction */

var queue = new Queue(),
    imageCache = new CacheList(function (file, finish) {
        queue.add(function (done) {
            loadImage(file, finish);
            done();
        })
    }),
    graph = new Graph(queue, imageCache),
    network = new Network(),
    inputNeurons = new Map(),
    graphView = new GraphView(document.getElementById('graph'), graph, queue, imageCache),
    networkView = new NetworkView(document.getElementById('network'), network),
    context = new GraphView(document.getElementById('context')),
    i;

for (i = 0; i < 200; i += 1) {
    network.addNeuron();
}

// connect graph to network
graph.onaddtrigger.add(function (event) {
    'use strict';
    inputNeurons.set(event.data.id, network.addNeuron());
});
graph.onvertexconnected.add(function (event) {
    'use strict';
    queue.prepend(function (finish) {
        graph.nearestTriggers(event.data.id, 2).forEach(function (id) {
            inputNeurons.get(id).stimulate(1);
        });
        finish();
    });
});

// actions
var textAction = new TextAction(network, document.getElementById('textAction'));
textAction.onchangerecent.add(function (event) {
    'use strict';
    document.getElementById('textAction').value = event.data.recent;
});
textAction.onword.add(function (event) {
    'use strict';
    graph.searchSimilar(event.data.word, 5, function (result) {
        if (result.length) {
            network.reward(-0.5 + result.reduce(function (prev, curr) {
                return prev + curr[1];
            }, 0) / result.length);
        } else {
            network.reward(-0.5);
        }
    });
});
'abcdefghijklmnopqrstuvwxyz .?'.split('').forEach(function (c) {
    'use strict';
    network.addAction(function () { textAction.add(c); });
});
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
    Array.from(this.files).forEach(function (f) {
        if (isImageFile(f)) {
            graph.add(f);
        }
    })
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
    var last = 0,
        running = false;
    function showContext() {
        running = false;
        if (!graph.vertices.has(last)) { return; }
        context.clear();
        graph.nearest(last, 1).forEach(function (id) {
            var v = graphView.vertices.get(id),
                vw = new VertexView(v.id, v.value, context);
            [vw.w, vw.h] = [v.w, v.h];
            context.addVertex(vw);
        });
        graphView.edges.forEach(function (e) {
            var v1 = context.vertices.get(e.vertex1.id),
                v2 = context.vertices.get(e.vertex2.id);
            if (v1 && v2) {
                context.addEdge(new EdgeView(e.id, v1, v2));
            }
        });
        context.layout.postMessage({fixvertex: {id: last, x: context.canvas.width / 2, y: context.canvas.height / 2}});
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
