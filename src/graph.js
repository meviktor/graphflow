export class Graph {
    constructor(numberOfNodes, edges, cutSNodes = null){
        this.numberOfNodes = numberOfNodes;
        this.edges = edges;
        this.cutProvided = cutSNodes != null && cutSNodes != undefined;
        this.cutSNodes = this.cutProvided ? 
            (cutSNodes.includes(1) ? cutSNodes : Array.from({length: numberOfNodes}, (_, i) => i + 1).filter(node => !cutSNodes.includes(node))) :
            null;
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
    constructor(graph, errors, networkFlowValue, cutValue){
        this.graph = graph;
        this.errors = errors;
        this.validNetwork = !errors || !errors.some(error => error.type == NetworkError.FLOW_ERROR);
        this.validCut = !errors || !errors.some(error => error.type == NetworkError.CUT_ERROR);
        this.networkFlowValue = networkFlowValue;
        this.cutValue = cutValue;
    }

    static getProperties(graph){
        var errors = this.validateNetworkAndCut(graph);

        var flowErrors = errors && errors.some(error => error.type == NetworkError.FLOW_ERROR);
        var cutErrors = errors && errors.some(error => error.type == NetworkError.CUT_ERROR);

        var networkFlowValue = !flowErrors ? this.#calculateFlow(1, graph.edges, false) : null;
        var cutValue = (!cutErrors && graph.cutSNodes) ? this.#getCutEdges(graph.cutSNodes, graph.edges)
                                        .map(edge => edge.flowValue)
                                        .reduce((accumulator, flowValue) => accumulator + flowValue, 0)
                                : null;

        return new NetworkProperties(graph, errors, networkFlowValue, cutValue);
    }

    static validateNetworkAndCut(graph) {
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

        if(graph.cutProvided){
            if(graph.cutSNodes.includes(1) && graph.cutSNodes.includes(graph.numberOfNodes)){
                errors.push(new NetworkError(NetworkError.CUT_ERROR, CUT_ERROR_SOURCE_SINK_IN_ONE_SET));
            }
        }

        return errors.length == 0 ? null : errors;
    }

    static #calculateFlow(node, edges, incoming){
        return edges.filter(edge => (incoming ? edge.toNode : edge.fromNode) == node)
            .map(edge => edge.flowValue)
            .reduce((accumulator, flowValue) => accumulator + flowValue, 0);
    }

    static #getCutEdges(cutSNodes, edges){
        var cutEdges = [];
        edges.forEach(edge => {
            if(cutSNodes.includes(edge.fromNode) && !cutSNodes.includes(edge.toNode)){
                cutEdges.push(edge);
            }
        });
        return cutEdges;
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