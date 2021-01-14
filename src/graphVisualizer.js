import cytoscape from 'cytoscape';

export class GraphVisualizer{
    static visualize(graph, graphContainerId){
        var container = document.getElementById(graphContainerId);

        var elements = [];
        // nodes
        for(var i = 1; i <= graph.numberOfNodes; ++i){
            elements.push({data: { id: i } });
        }
        // edges
        for(var i = 0; i < graph.edges.length; ++i){
            elements.push({ data: {
                id: `Node#${i + 1}`,
                source: graph.edges[i].fromNode,
                target: graph.edges[i].toNode,
                flowAndCapacity: `${graph.edges[i].flowValue} / ${graph.edges[i].capacity}`,
            } });
        }

        var layout = {name: 'random'}

        var style = [
            {
                selector: 'node',
                style: {
                  'text-valign': 'top',
                  'text-halign': 'left',
                  'background-color': '#000000',
                  'label': 'data(id)'
                }
            },
            {
                selector: 'edge',
                style: {
                  'text-valign': 'top',
                  'text-halign': 'center',
                  'target-arrow-color': '#bbbbbb',
                  'target-arrow-shape': 'triangle',
                  'line-color': '#bbbbb',
                  'line-style': 'solid',
                  'label': 'data(flowAndCapacity)',
                  'curve-style': 'bezier'
                }
            }
        ]

        return cytoscape({
            container: container,
            elements: elements,
            style: style,
            layout: layout
        });
    }
}