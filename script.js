const canvas = document.getElementById('graphCanvas');
// Gets the canvas element from the HTML document.

const ctx = canvas.getContext('2d');
// gets the 2d rendering context for canvas

const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.createElement('button');
// creating reset button

resetBtn.textContent = 'Reset';
resetBtn.style.display = 'none';
visualizeBtn.parentNode.insertBefore(resetBtn, visualizeBtn.nextSibling);
// First accessing the parent element that contains visualize button

// .insertBefore(): This is a method used to insert a new node into the DOM. It takes two parameters:
// The first parameter is the new node to insert (in this case, resetBtn).
// The second parameter is the reference node, before which the new node should be inserted.

// visualizeBtn.nextSibling: This refers to the next sibling element of visualizeBtn in the DOM tree. If visualizeBtn is the last child of its parent, this will be null.

// The code is telling the parent of visualizeBtn to insert resetBtn before the next sibling of visualizeBtn.
// If visualizeBtn is the last child, this effectively appends resetBtn to the end of the parent's children.
// If visualizeBtn has a next sibling, resetBtn will be inserted between visualizeBtn and its next sibling.
const graph = {
    a: {b: 22, d: 8},
    b: {a: 22, c: 20, e: 2},
    c: {b: 20, d: 10, e: 4, f: 7},
    d: {a: 8, c: 10, f: 6},
    e: {b: 2, c: 4, z: 4},
    f: {c: 7, d: 6, z: 9},
    z: {e: 4, f: 9}
};
// Theoretically a graph defined by the object data structure of javascript

const nodePositions = {
    a: {x: 50, y: 200},
    b: {x: 150, y: 100},
    c: {x: 300, y: 200},
    d: {x: 150, y: 300},
    e: {x: 450, y: 100},
    f: {x: 450, y: 300},
    z: {x: 550, y: 200}
};

let visitedNodes = new Set();
let visitedEdges = new Set();
let finalPath = [];
// Sets are used for visitedNodes and visitedEdges because:
// a) Fast lookup: Sets in JavaScript are optimized for rapid checking of whether an element exists. This operation is O(1) on average, which is crucial when frequently checking if a node or edge has been visited.
// b) No duplicates: Sets automatically ensure that each element is unique. In Dijkstra's algorithm, we only need to know if a node or edge has been visited once; we don't need to track multiple visits.

// An Array is used for finalPath because:
// a) Order matters: The final path needs to maintain the order of nodes from start to end. Arrays in JavaScript maintain insertion order.

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Clears the canvas (start Coordinates, end coordinate)

    for (const [node, neighbors] of Object.entries(graph)) {
        for (const [neighbor, weight] of Object.entries(neighbors)) {
            drawEdge(node, neighbor, weight);
        }
    }
    
    for (const [node, position] of Object.entries(nodePositions)) {
        drawNode(node, position);
    }
    // see diary
}

function drawNode(node, position) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, 20, 0, 2 * Math.PI);
    
    // Only mark nodes in the finalPath as green
    ctx.fillStyle = finalPath.includes(node) ? 'green' : 'white';
    
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '16px Arial';
    ctx.fillText(node, position.x, position.y);
}

function drawEdge(node1, node2, weight) {
    const pos1 = nodePositions[node1];
    const pos2 = nodePositions[node2];
    ctx.beginPath();
    ctx.moveTo(pos1.x, pos1.y);
    ctx.lineTo(pos2.x, pos2.y);
    
    if (isEdgeInFinalPath(node1, node2)) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
    } else if (visitedEdges.has(`${node1}-${node2}`) || visitedEdges.has(`${node2}-${node1}`)) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
    } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
    }
    
    ctx.stroke();
    ctx.lineWidth = 1;
    
    // Draw weight
    const midX = (pos1.x + pos2.x) / 2;
    const midY = (pos1.y + pos2.y) / 2;
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.fillText(weight.toString(), midX, midY);
}
// draw node and draw edge functions are separated to make highlighting process easy
function isEdgeInFinalPath(node1, node2) {
    for (let i = 0; i < finalPath.length - 1; i++) {
        if ((finalPath[i] === node1 && finalPath[i+1] === node2) ||
            (finalPath[i] === node2 && finalPath[i+1] === node1)) {
            return true;
        }
    }
    return false;
}

function dijkstra(start, end) {
    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(graph));

    for (const node of unvisited) {
        distances[node] = Infinity;
    }
    distances[start] = 0;

    visitedNodes.add(start);

    function getMinDistanceNode() {
        return [...unvisited].reduce((min, node) => 
            distances[node] < distances[min] ? node : min
        );
    }

    function step() {
        if (unvisited.size === 0) {
            finishVisualization(previous, start, end);
            return;
        }

        const current = getMinDistanceNode();
        unvisited.delete(current);
        visitedNodes.add(current);

        if (current === end) {
            finishVisualization(previous, start, end);
            return;
        }

        for (const [neighbor, weight] of Object.entries(graph[current])) {
            if (unvisited.has(neighbor)) {
                const alt = distances[current] + weight;
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = current;
                    visitedEdges.add(`${current}-${neighbor}`);
                }
            }
        }

        drawGraph();

        setTimeout(step, 1000); 
    }

    step();
}

function finishVisualization(previous, start, end) {
    console.log('Visualization complete');
    finalPath = getPath(previous, start, end);
    console.log('Shortest path:', finalPath);
    drawGraph(); // Redraw to show the final path
    resetBtn.style.display = 'inline-block';
    visualizeBtn.disabled = true;
}

function getPath(previous, start, end) {
    const path = [];
    let current = end;
    while (current !== undefined && current !== start) {
        path.unshift(current);
        current = previous[current];
    }
    if (current === undefined) {
        console.error('No path found');
        return [];
    }
    path.unshift(start);
    return path;
}

function visualizeAlgorithm() {
    visitedNodes.clear();
    visitedEdges.clear();
    finalPath = [];
    dijkstra('a', 'z');
}

function reset() {
    visitedNodes.clear();
    visitedEdges.clear();
    finalPath = [];
    drawGraph();
    resetBtn.style.display = 'none';
    visualizeBtn.disabled = false;
}


visualizeBtn.addEventListener('click', visualizeAlgorithm);
resetBtn.addEventListener('click', reset);
drawGraph();