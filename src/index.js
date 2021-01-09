import { Graph, Edge } from './graph';

var graph;
var numberOfNodes = 0;
var numberOfEdges = 0;

const GRAPH_MINIMUM_NODES = 2;
const GRAPH_MINIMUM_EDGES = 1;

const EDRE_ROW_ID = "edge";
const EDGE_EDITOR_ID = "edgeEditor";
const EDGE_EDITOR_ROW_CONTAINER_ID = "edgeEditorRows";
const EDGE_FROM_NODE_CLASS = "fromNode";
const EDGE_TO_NODE_CLASS = "toNode";
const EDGE_EDGE_CAPACITY_CLASS = "edgeCapacity";
const EDGE_FLOW_VALUE_CLASS = "flowValue";
const NUM_NODES_NOT_VALID = `Number of nodes provided is not valid! Minimum value must be enterd: ${GRAPH_MINIMUM_NODES}.`;
const NUM_EDGES_NOT_VALID = `Number of edges provided is not valid! Minimum value must be enterd: ${GRAPH_MINIMUM_EDGES}.`;
const SOURCE_TEXT = 'will be treated as source';
const SINK_TEXT = 'will be treated as sink';

$(document).ready(function(){
    hideById(EDGE_EDITOR_ID);
    $("#setNumOfNodesAndEdges").click(onSetNumberOfNodesAndEdges);
    $("#setNetworkProperties").click(onSetNetworkProperties);
});

function onSetNumberOfNodesAndEdges(){
    var numNodes = Number($("#numNodes")[0].value);
    var numEdges = Number($("#numEdges")[0].value);

    if(!numberOfDotsValid(numNodes)){
        alert(NUM_NODES_NOT_VALID);
        return;
    }
    if(!numberOfEdgesValid(numEdges)){
        alert(NUM_EDGES_NOT_VALID);
        return;
    }

    numberOfNodes = numNodes;
    numberOfEdges = numEdges;

    generateEdgeRows();
    showById(EDGE_EDITOR_ID);
}

function numberOfDotsValid(numNodes){
   return numNodes != NaN && numNodes >= GRAPH_MINIMUM_NODES;
}

function numberOfEdgesValid(numEdges){
    return numEdges != NaN && numEdges >= GRAPH_MINIMUM_EDGES;
}

function generateEdgeRows(){
    var edgeRowsHTML = `<p>Node #1 ${SOURCE_TEXT} and node #${numberOfNodes} ${SINK_TEXT}.</p><br>`;
    for(var i = 0; i < numberOfEdges; ++i){
        edgeRowsHTML += `<div class="row" id="${EDRE_ROW_ID}${i}">
            <div class="col"><b>Edge #${i + 1}</b></div>
            <div class="form-group col">
                <label>From node: </label>
                <input type="number" class="${EDGE_FROM_NODE_CLASS}" min="1" max="${numberOfNodes}"/>
            </div>
            <div class="form-group col">
                <label>To node: </label>
                <input type="number" class="${EDGE_TO_NODE_CLASS}" min="1" max="${numberOfNodes}"/>
            </div>
            <div class="form-group col">
                <label>Edge capacity: </label>
                <input type="number" class="${EDGE_EDGE_CAPACITY_CLASS}" min="0"/>
            </div>
            <div class="form-group col">
                <label>Flow value: </label>
                <input type="number" class="${EDGE_FLOW_VALUE_CLASS}" min="0"/>
            </div>
        </div>\n`;
    }
    $(`#${EDGE_EDITOR_ROW_CONTAINER_ID}`).html(edgeRowsHTML);
}

function onSetNetworkProperties(){
    try{
        graph = composeGraph();
        console.log(graph);
    }
    catch(e){
        alert(e.message);
        return;
    }
    // TODO: start the work with the input graph
}

function composeGraph(){
    var edges = [];
    for(var i = 0; i < numberOfNodes; i++){
        var edgeDataContainer = $(`#${EDRE_ROW_ID + i}`);

        var fromNode = Number(edgeDataContainer.find($(`.${EDGE_FROM_NODE_CLASS}`))[0].value);
        var toNode = Number(edgeDataContainer.find($(`.${EDGE_TO_NODE_CLASS}`))[0].value);
        var edgeCapacity = Number(edgeDataContainer.find($(`.${EDGE_EDGE_CAPACITY_CLASS}`))[0].value);
        var flowValue = Number(edgeDataContainer.find($(`.${EDGE_FLOW_VALUE_CLASS}`))[0].value);

        var edge = new Edge(fromNode, toNode, edgeCapacity, flowValue);

        if(!IsEdgeValid(edge)){
            throw Error(`Check the entered values of node ${i + 1} - some of them may be missing or invalid.`);
        }

        edges.push(edge);
    }
    return new Graph(numberOfNodes, edges, false);
}

function IsEdgeValid(edge){
    return (edge.fromNode != NaN && edge.toNode != NaN && edge.capacity != NaN && edge.flowValue != NaN) &&
        (edge.fromNode > 0 && edge.fromNode <= numberOfNodes) &&
        (edge.toNode > 0 && edge.toNode <= numberOfNodes) &&
        (edge.capacity >= 0 && edge.flowValue >= 0);
}

function hideById(id){
    $(`#${id}`).hide();
}

function showById(id){
    $(`#${id}`).show();
}