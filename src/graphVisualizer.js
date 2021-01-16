import cytoscape from 'cytoscape';

export class GraphVisualizer{
    static visualize(networkProperites, graphContainerId){
        var container = document.getElementById(graphContainerId);
        var graph = networkProperites.graph;

        var elements = [];
        // nodes
        for(var node = 1; node <= graph.numberOfNodes; ++node){
            elements.push({ data: {
                id: node,
                displayText: node == 1 ? `${node} (src)` : ( node == graph.numberOfNodes ? `${node} (sink)` : node),
                class: (graph.cutProvided && networkProperites.validCut) ? (graph.cutSNodes.includes(node) ? "sNodes" : "tNodes") : "regular" 
            } });
        }
        // edges
        for(var i = 0; i < graph.edges.length; ++i){
            elements.push({ data: {
                id: `Node#${i + 1}`,
                class: (graph.cutProvided && networkProperites.validCut) ? (networkProperites.cutEdgeIds.includes(graph.edges[i].id) ? "edgeInCut" : "edgeOutOfCut" ) : "regular",
                source: graph.edges[i].fromNode,
                target: graph.edges[i].toNode,
                flowAndCapacity: `${graph.edges[i].flowValue} / ${graph.edges[i].capacity}`
            } });
        }

        var layout = {name: 'circle'};

        var style = [
            {
                selector: 'node[class = "regular"]',
                style: {
                  'text-valign': 'top',
                  'text-halign': 'left',
                  'background-color': '#000000',
                  'label': 'data(displayText)'
                }
            },
            {
                selector: 'node[class = "sNodes"]',
                style: {
                  'text-valign': 'top',
                  'text-halign': 'left',
                  'background-color': '#ff0000',
                  'label': 'data(displayText)'
                }
            },
            {
                selector: 'node[class = "tNodes"]',
                style: {
                  'text-valign': 'top',
                  'text-halign': 'left',
                  'background-color': '#0000ff',
                  'label': 'data(displayText)'
                }
            },
            {
                selector: 'edge[class = "regular"], edge[class = "edgeOutOfCut"]',
                style: {
                  'text-valign': 'top',
                  'text-halign': 'center',
                  'target-arrow-color': '#bbbbbb',
                  'target-arrow-shape': 'triangle',
                  'line-color': '#bbbbbb',
                  'line-style': 'solid',
                  'label': 'data(flowAndCapacity)',
                  'curve-style': 'bezier'
                }
            },
            {
                selector: 'edge[class = "edgeInCut"]',
                style: {
                  'text-valign': 'top',
                  'text-halign': 'center',
                  'target-arrow-color': '#ff7a7a',
                  'target-arrow-shape': 'triangle',
                  'line-color': '#ff7a7a',
                  'line-style': 'solid',
                  'label': 'data(flowAndCapacity)',
                  'curve-style': 'bezier'
                }
            }
        ];

        return cytoscape({
            container: container,
            elements: elements,
            style: style,
            layout: layout
        });
    }
}