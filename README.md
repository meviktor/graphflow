# Graphflow
This tool can be used to check if a flow is allowed on a given flow network (whether fundamental properties are met or not). Cut value calculation is also provided.

## Get started
To run locally after checkout, you have to issue only these commands:
```
npm install
npm start
```
Then open the following site in your browser: http://localhost:8080

## How to determine a flow network and a flow
There are two options:

 - You can use the network editor provided by the tool (a bit slower).
 - You can upload a JSON file which contains the necessary data (recommended).

### Network editor
- In the first step you have to enter the number of the nodes and edges.
- Then you are able to determine the flow network and the flow by the edges. For every edge, you have to provide a node where the edge is starting from and a node which serves as an arrival point. You have to enter the capacity and the flow value for the actual edge as well.
- It is optional, but you can choose nodes as one node set for the cut calculation. The other node set will contain the not selected nodes.

### JSON file
An example for a well formatted file can be found [here](https://github.com/meviktor/graphflow/blob/master/src/graphJson.json). The following fields are present in this file (fields with other names will be ignored):

 - *numberOfNodes*: required, specifies how many nodes are in the directed graph.
 - *edges*: an array, which contains the edges of the directed graph. Every edge is represented by its own object, which has to contain all of the following fields (all of them are required): 
 >- *fromNode*: the node where the edge is starting from.
 >- *toNode*: the node where the edge is arriving to.
 >- *capacity*: the capacity of the actual edge.
 >- *flowValue*: the value of the flow on the actual edge.
- *cutSNodes*: optional. An array contains one of the node sets used when specifying the cut (value). If you don't want to execute cut calculation, just set its value to *null* or just delete the field from the JSON.

## Nodes
We specify the nodes by one number - how many nodes will be present in the graph. Different nodes are identified by their number. For example if we provide the number 6 as the number of nodes, then the graph will have six nodes with the ids: 1, 2, 3, 4, 5, 6. 
**Important:** in every flow network there are two nodes having special role: the *source* and the *sink*. **Source** will be **always the first node** (*id: 1*) and **sink** will be **always the last node** having the *highest id* (in our example: 6).


## Results

After you entered the necessary data trough the network editor or uploaded the JSON file, you are ready to see the results. On the top you can see the network flow value (if your flow is allowed on your flow network) and the cut value (if an appropriate node set for the cut was provided).
In the next row on the left you can see a graph visualization of your flow network. On the right side you can see the found errors related to the flow and the cut (if any).
If a (valid) node set for cut calculation was provided, the result will contain a colored graph:

 - The node set contains the *source* node will be colored as *red*
 - The node set contains the *sink* node will be colored as *blue*
 - The edges belongs to the cut will be colored as *light red*

## Notes
- Graph visualization were created using [cytoscape.js](https://github.com/cytoscape/cytoscape.js/tree/master).
- This project has a demo site where the application can be tried out: https://networksandflows.azurewebsites.net/.


 ## MML101piE-1 (hungarian)
 Ez a projekt a 2020/21/1 szemeszterben tarttott Gráfelmélet (levelező) tárgy vizsgaprojektje. A választott feladat:
 
 *"5. Folyamok alapfogalmai:
A program kérjen be egy hálózatot + folyamot (valamilyen formában, lehetőleg fájlból: meg kell adni egy irányított gráfot, egy forrást, egy nyelőt, és az élkapacitásokat + az éleken átfolyó anyagmennyiséget). A program eldönti, hogy a folyam megengedett-e (teljesülnek-e a megmaradási feltételek stb.), kiszámolja a folyam értékét, illetve tudjon vágás kapacitást számolni (az inputokkal együtt bekérheti az S halmazt)."*

### Fájlok

 A projekt három fő JavaScript állományt tartalmaz (a HTML markup-on valamint a CSS-en kívül):
 
 - *index.js*: ebben leginkább a felhasználói felületet működtető kód van, a konkrét feladat szempontjából kevésbé releváns. Van benne azonban egy-két függvény, amely alapvető validációt végez az inputon (itt még nem a folyam tulajdonságokról van szó, hanem leginkább arról, hogy érvényes-e az input, pl. lehet-e belőle egyáltalán egy irányított gráfot összerakni), csak ezeket jelöltem ebben a fájlban kommenttel.
 - *graph.js*: ebbe a fájlba szerveztem ki azt a kódot, ami a konkrét feladatot végzi el (folyam tualjdonságok teljesülnek-e, vágáshoz megadott csúcshalmaz jó-e, folyam értékének, vágás értékének számítása, stb). Ebbe a fájlba annyi kommentet tettem, amennyi csak lehetséges.
 - *graphVisualizer.js*: az ebben található *GraphVisualizer* osztály vizualizálja az általunk megadott hálózatot.

### Felület
A felület fentebb már nagyjából be lett muatatva. Egy megjegyzést tennék itt: az előállított gráf nem "fix", a csúcsait szabadon lehet húzgálni ide-oda, bele lehet nagyítani a gráfba. Az alkalmazás kipróbálható a *Notes* szekcióban található weboldalon.
