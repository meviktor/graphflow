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

export class NetworkProperties {
    constructor(graph, networkErrors, cutErrors, networkFlowValue){
        this.graph = graph;
        this.validNetwork = networkErrors == null;
        this.networkErrors = networkErrors;
        this.validCut = cutErrors == null;
        this.cutErrors = cutErrors;
        this.networkFlowValue = networkFlowValue;
        //TODO: add cut value!!!
        this.cutValue = 0;
    }

    static validateNetwork(graph) {
        var errors = [];
        const sourceNode = 1;
        const sinkNode = graph.numberOfNodes;

        for(var i = 0; i < graph.edges.length; i++){
            if(graph.edges[i].capacity < graph.edges[i].flowValue){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_EDGE_CAPACITY + (i + 1) ));
            }
            if(graph.edges[i].toNode == sourceNode){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_EDGE_TO_SOURCE));
            }
            if(graph.edges[i].fromNode == sinkNode){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_EDGE_FROM_SINK));
            }
        }
        
        for(var node = sourceNode + 1; node < sinkNode; node++){
            var incomingFlow = this.#calculateFlow(node, graph.edges, true);
            var outgoingFlow = this.#calculateFlow(node, graph.edges, false);

            if(incomingFlow != outgoingFlow){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_NODE + node));
            }
        }

        return errors.length == 0 ? null : errors;
    }

    static #calculateFlow(node, edges, incoming){
        return edges.filter(edge => (incoming ? edge.toNode : edge.fromNode) == node)
            .map(edge => edge.flowValue)
            .reduce((accumulator, flowValue) => accumulator + flowValue, 0);
    }

    static validateCutOnNetwork(graph){
        // TODO: impelent me!
        return null;
    }

    static getProperties(graph){
        var networkErrors = this.validateNetwork(graph);
        var cutErrors = graph.cutProvided ? this.validateCutOnNetwork(graph) : null;
        var networkFlowValue = !networkErrors ? this.#calculateFlow(1, graph.edges, false) : null;
        // TODO: calculate cut value as well!

        return new NetworkProperties(graph, networkErrors, cutErrors, networkFlowValue);
    }
}

export class NetworkError{
    static FLOW_ERROR = 0;
    static CUT_ERROR = 1;
    constructor(type, message){
        this.type = type;
        this.message = message;
    }
}

const FLOW_ERROR_EDGE_CAPACITY = 'The capacity of the edge is less than the entered flow value on edge ';
const FLOW_ERROR_EDGE_TO_SOURCE = 'You cannot use edges directed to the source as a destination!';
const FLOW_ERROR_EDGE_FROM_SINK = 'You cannot use edges directed from the sink as a departure point!';
const FLOW_ERROR_NODE = 'The values of incoming and outgoing flow are not equal on node ';
const CUT_ERROR_SOURCE_SINK_IN_ONE_SET = 'Soucre and sink must be in seperate node sets!';