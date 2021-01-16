import { Graph, Edge, NetworkProperties, NetworkError } from './graph';
import { GraphVisualizer } from './graphVisualizer';

var graphVisualization;
var graph;
var numberOfNodes = 0;
var numberOfEdges = 0;

const GRAPH_MINIMUM_NODES = 2;
const GRAPH_MINIMUM_EDGES = 1;

const GRAPH_VISUALIZATION_ID = 'graphContainer';
const EDRE_ROW_ID = "edge";
const RESULTS_ID = "resultBox";
const RESULT_FLOW_ID = "networkFlowValue";
const RESULT_CUT_ID = "networkCutValue";
const RESULT_FLOW_ERRORS_ID = "flowErrors";
const RESULT_CUT_ERRORS_ID = "cutErrors";
const EDGE_EDITOR_ID = "edgeEditor";
const CUT_NODES_EDITOR_ID = "cutEditor";
const EDGE_EDITOR_ROW_CONTAINER_ID = "edgeEditorRows";
const EDGE_FROM_NODE_CLASS = "fromNode";
const EDGE_TO_NODE_CLASS = "toNode";
const EDGE_EDGE_CAPACITY_CLASS = "edgeCapacity";
const EDGE_FLOW_VALUE_CLASS = "flowValue";
const NODE_CHECKBOX_CLASS = "cut_nodeCheckbox";
const NUM_NODES_NOT_VALID = `Number of nodes provided is not valid! Minimum value can be entered here: ${GRAPH_MINIMUM_NODES}.`;
const NUM_EDGES_NOT_VALID = `Number of edges provided is not valid! Minimum value can be entered here: ${GRAPH_MINIMUM_EDGES}.`;
const SOURCE_TEXT = 'will be treated as source';
const SINK_TEXT = 'will be treated as sink';
const ERR_CHOOSE_JSON = 'Please choose a JSON file for upload!';
const ERR_JSON_NUMBER_OF_NODES = 'The JSON file must contain the field named "numberOfNodes" with the number of nodes (at least 2)!';
const ERR_JSON_EDGES = 'The JSON file must contain the array named "edges" with the list of the edges in it!';
const ERR_JSON_WRONG_SYNTAX = 'One or more errors found in the syntax of your JSON file!';
const ERR_JSON_FILE_ACCESS = 'A problem occured while working with your JSON file - try to unselect the file then choose it again! See console (F12) for details.';
const ERROR_PANEL_INNER_CONTENT_ID = "errorPanelInnerContent";

$(document).ready(function(){
    hideById(EDGE_EDITOR_ID);
    hideById(RESULTS_ID);
    $("#setNumOfNodesAndEdges").click(onSetNumberOfNodesAndEdges);
    $("#setNetworkProperties").click(onSetNetworkProperties);
    $("#setNetworkPropertiesFromFile").click(onSetNetworkPropertiesFromFile);
});

function onSetNumberOfNodesAndEdges(){
    var numNodes = Number($("#numNodes")[0].value);
    var numEdges = Number($("#numEdges")[0].value);

    if(!numberOfDotsValid(numNodes)){
        displayErrorOnPage(NUM_NODES_NOT_VALID);
        return;
    }
    if(!numberOfEdgesValid(numEdges)){
        displayErrorOnPage(NUM_EDGES_NOT_VALID);
        return;
    }

    numberOfNodes = numNodes;
    numberOfEdges = numEdges;

    generateEdgeRows();
    generateCutCheckboxes();
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
                <label>Flow value: </label>
                <input type="number" class="${EDGE_FLOW_VALUE_CLASS}" min="0"/>
            </div>
            <div class="form-group col">
                <label>Edge capacity: </label>
                <input type="number" class="${EDGE_EDGE_CAPACITY_CLASS}" min="0"/>
            </div>
        </div>`;
    }
    $(`#${EDGE_EDITOR_ROW_CONTAINER_ID}`).html(edgeRowsHTML);
}

function generateCutCheckboxes(){
    var cutEditorHTML = `<p>Select the nodes wanted to be in the same egde set. If you don't want to provide an edge set for cut value calculation, just leave the checkboxes unticked.</p>`;
    cutEditorHTML += `<div class="row">`
    for(var node = 1; node <= numberOfNodes; ++node){
        cutEditorHTML += `<div class="col nodeCheckboxContainer">
            <input type="checkbox" class="${NODE_CHECKBOX_CLASS}" value="${node}"/>
            <label class="nodeChkLabel">${node}${node == 1 ? " (source)" : (node == numberOfNodes ? " (sink)" : "")}</label>
            </div>`
        ;
    }
    cutEditorHTML += `</div>`;
    $(`#${CUT_NODES_EDITOR_ID}`).html(cutEditorHTML);
}

function onSetNetworkProperties(){
    try{
        graph = composeGraph();
        console.log(graph);
    }
    catch(e){
        displayErrorOnPage(e.message);
        return;
    }
    displayProperties(NetworkProperties.getProperties(graph));
}

async function onSetNetworkPropertiesFromFile(){
    var jsonFile = document.getElementById('networkFileInput').files[0];

    if(!jsonFile){
        displayErrorOnPage(ERR_CHOOSE_JSON);
        return;
    }
    else{
        var rawStr, graphJson;

        try{
            rawStr = await jsonFile.text();
        }
        catch(e){
            displayErrorOnPage(ERR_JSON_FILE_ACCESS);
            console.log(`Error - ${jsonFile.name}: ${e.message}`);
            return;
        }

        try{
            graphJson = JSON.parse(rawStr);
        }
        catch(e){
            displayErrorOnPage(ERR_JSON_WRONG_SYNTAX);
            return;
        }

        try{
            checkNetworkFromFile(graphJson);
        }
        catch(e){
            displayErrorOnPage(e.message);
            return;
        }

        var edges = [];
        graphJson.edges.forEach(e => {
            edges.push(new Edge(e.fromNode, e.toNode, e.capacity, e.flowValue));
        });
        graph = new Graph(graphJson.numberOfNodes, edges, graphJson.cutSNodes);

        displayProperties(NetworkProperties.getProperties(graph));
    }
}

function composeGraph(){
    var edges = [];
    for(var i = 0; i < numberOfEdges; i++){
        var edgeDataContainer = $(`#${EDRE_ROW_ID + i}`);

        var fromNode = Number(edgeDataContainer.find($(`.${EDGE_FROM_NODE_CLASS}`))[0].value);
        var toNode = Number(edgeDataContainer.find($(`.${EDGE_TO_NODE_CLASS}`))[0].value);
        var edgeCapacity = Number(edgeDataContainer.find($(`.${EDGE_EDGE_CAPACITY_CLASS}`))[0].value);
        var flowValue = Number(edgeDataContainer.find($(`.${EDGE_FLOW_VALUE_CLASS}`))[0].value);

        var edge = new Edge(fromNode, toNode, edgeCapacity, flowValue);

        if(!IsEdgeValid(edge)){
            throw Error(`Check the entered values of edge ${i + 1} - some of them may be missing or invalid.`);
        }

        edges.push(edge);
    }

    var cutSNodes = [];
    var chkQuery = $(`.${NODE_CHECKBOX_CLASS}`);
    for(var i = 0; i < chkQuery.length; ++i){
        if(chkQuery[i].checked){
            cutSNodes.push(Number(chkQuery[i].value));
        }
    }
    
    return new Graph(numberOfNodes, edges, cutSNodes.length != 0 ? cutSNodes : null);
}

function checkNetworkFromFile(graphJson){
    var nodes = Number(graphJson.numberOfNodes);

    if(isNaN(nodes) || nodes <= 0){
        throw Error(ERR_JSON_NUMBER_OF_NODES);
    }
    if(!graphJson.edges || graphJson.edges.length == 0){
        throw Error(ERR_JSON_EDGES);
    }
    numberOfNodes = nodes;
    numberOfEdges = graphJson.edges;

    graphJson.edges.forEach((edge, i) => {
        if(!IsEdgeValid(edge)){
            numberOfNodes = 0;
            numberOfEdges = 0;
            throw Error(`Check the entered values of edge ${i + 1} - some of them may be missing or invalid.`);
        }
    });

    if(graphJson.cutSNodes && graphJson.cutSNodes.length != 0){
        graphJson.cutSNodes.forEach(node => {
            if(node < 1 || node > graphJson.numberOfNodes){
                throw Error(`Invalid node number in the provided cut set! Node #${node} does not exist in the graph!`);
            }
        });
    }
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

function displayProperties(properties){
    var flowResult = properties.validNetwork ? properties.networkFlowValue : "-"
    $(`#${RESULT_FLOW_ID}`).html(flowResult);

    var cutResult = properties.graph.cutProvided ? (properties.validCut ? properties.cutValue : "-") : "-";
    $(`#${RESULT_CUT_ID}`).html(cutResult);

    $(`#${RESULT_FLOW_ERRORS_ID}`).html(generateErrorListHTML(properties.errors, NetworkError.FLOW_ERROR));
    $(`#${RESULT_CUT_ERRORS_ID}`).html(generateErrorListHTML(properties.errors, NetworkError.CUT_ERROR));

    showById(RESULTS_ID);

    graphVisualization = GraphVisualizer.visualize(properties, GRAPH_VISUALIZATION_ID);
}

function generateErrorListHTML(errors, errorType){
    var filteredErrors = errors ? errors.filter(error => error.type == errorType) : [];
    if(filteredErrors.length == 0){
        return "<br><p>No errors found.</p>";
    }
    else {
        var html = `<div style="color: red;"><ul>`;
        for(var i = 0; i < filteredErrors.length; ++i){
            html += `<li>${filteredErrors[i].message}</li>`;
        }
        html += "</ul></div>";
        return html;
    }
}

function displayErrorOnPage(message){
    var errorPopupHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>`;
    $(`#${ERROR_PANEL_INNER_CONTENT_ID}`).append(errorPopupHTML);
}