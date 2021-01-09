export class Graph {
    constructor(numberOfNodes, edges, cutProvided, cutSNodes = null, cutTNodes = null){
        this.numberOfNodes = numberOfNodes;
        this.edges = edges;
        this.cutProvided = cutProvided;
        this.cutSNodes = cutProvided ? cutSNodes : null;
        this.cutTNodes = cutProvided ? cutTNodes : null;
    }
}

export class Edge {
    constructor(fromNode, toNode, capacity, flowValue){
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.capacity = capacity;
        this.flowValue = flowValue;
    }
}