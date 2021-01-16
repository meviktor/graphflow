import { v4 as uuid } from 'uuid';

/**
 * Egy halozatot + folyamot ad meg, illetve opciolnalisan egy vagast (csucsok egy csoportjaval megadva).
 */
export class Graph {
    /**
     * A Graph osztaly konstruktora.
     * @param {*} numberOfNodes A graf csucsainak szama - minden csucs egy egesz szammal van abrazolva (egesz szam).
     * @param {*} edges Az elek halmaza (eleket tartalmazo tömb).
     * @param {*} cutSNodes Ha adunk meg vagast is (opcionalis), a vagas altal meghatarozott egyik csucshalmaz (csucsokat - tehat egesz szamokat tartalmazo tomb).
     */
    constructor(numberOfNodes, edges, cutSNodes = null){
        this.numberOfNodes = numberOfNodes;
        this.edges = edges;
        this.cutProvided = cutSNodes != null && cutSNodes != undefined;
        /* A cutSNodes tomb mindig annak a csucshalmaznak a csucsait fogja tartalmazni, amelyben a forras is benne van (a forrast vesszuk az 1-es csucsnak). 
           Ha nem azt adjuk meg, hanem azt amiben a nyelo van, akkor vesszuk a megadott csucshalmaz "inverzet" (abban lesz benne a forras). */
        this.cutSNodes = this.cutProvided ? 
            (cutSNodes.includes(1) ? cutSNodes : Array.from({length: numberOfNodes}, (_, i) => i + 1).filter(node => !cutSNodes.includes(node))) :
            null;
    }
}

/**
 * A graf egy iranyitott ele. Tartalmazza a folyam erteket, valamint az elkapacitast is.
 */
export class Edge {
    /**
     * Az Edge osztaly konstruktora.
     * @param {*} fromNode Ebbol a csucsbol indul az el (egesz szam).
     * @param {*} toNode Ebbe a csucsba megy az el (egesz szam).
     * @param {*} capacity Az el kapacitasa (egesz szam).
     * @param {*} flowValue A folyam erteke az adott elen (egesz szam).
     */
    constructor(fromNode, toNode, capacity, flowValue){
        // Minden elhez rendelunk egy egyedi azonositot (UUID)
        this.id = uuid();
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.capacity = capacity;
        this.flowValue = flowValue;
    }
}

/**
 * A halozat kiertekelesenek eredmenyet (a halozat tulajdonsagait) tartalmazo osztaly.
 */
export class NetworkProperties {
    /**
     * A NetworkProperties osztaly konstruktora.
     * @param {*} graph A halozat + folyam (esetleg vagas), amit kiertekeltunk (Graph tipusu).
     * @param {*} errors A halozat (valamint a vagas, ha adtunk meg) kiertekelesekor talalt hibakat tartalmazo tomb (NetworkError tomb).
     * @param {*} networkFlowValue A folyam ereke (egesz szam).
     * @param {*} cutValue A vagas erteke (egesz szam).
     * @param {*} cutEdgeIds A vagas eleinek az azonositoit tartalmazo tomb.
     */
    constructor(graph, errors, networkFlowValue, cutValue, cutEdgeIds){
        this.graph = graph;
        this.errors = errors;
        // A folyam akkor megengedett ha egyaltalan nem talaltunk hibat, vagy legalabbis folyammal kapcsolatos hibat nem.
        this.validNetwork = !errors || !errors.some(error => error.type == NetworkError.FLOW_ERROR);
        // A vagas akkor megengedett ha egyaltalan nem talaltunk hibat, vagy legalabbis vagassal kapcsolatos hibat nem.
        this.validCut = !errors || !errors.some(error => error.type == NetworkError.CUT_ERROR);
        this.networkFlowValue = networkFlowValue;
        this.cutValue = cutValue;
        this.cutEdgeIds = cutEdgeIds;
    }

    /**
     * A kiertekelest vegzo fuggveny.
     * @param {*} graph Az input halozat + folyam (esetleg vagas) (Graph tipusu).
     * @returns A kiertekeles eredmenye (NetworkProperties objektum).
     */
    static getProperties(graph){
        // Leellenorizzuk, hogy a halozat + folyam, valamint a vagas megengedett-e
        var errors = this.validateNetworkAndCut(graph);

        // Folyammal kapcsolatos hibak
        var flowErrors = errors && errors.some(error => error.type == NetworkError.FLOW_ERROR);
        // Vagassal kapcsolatos hibak
        var cutErrors = errors && errors.some(error => error.type == NetworkError.CUT_ERROR);

        // Folyam eretkenek kiszamitasa: a forrasbol (1-es csucs) kimeno eleken a folyam ertekek osszege. Ha a folyam nem megengedett, nem szamoljuk ki.
        var networkFlowValue = !flowErrors ? this.#calculateFlow(1, graph.edges, false) : null;
        var cutValue, cutEdgeIds = null;
        // Ha adunk meg csucshalmazt a vagashoz, akkor kiszamoljuk a vagas erteket, valamint eltaroljuk a vagast alkoto elek azonositojat
        if(!cutErrors && graph.cutSNodes){
            // Vagas elei
            var cutEdges = this.#getCutEdges(graph.cutSNodes, graph.edges);
            // Vagas erteke: a vagas elein a kapacitasok osszege
            cutValue = cutEdges.map(edge => edge.capacity)
                .reduce((accumulator, capacity) => accumulator + capacity, 0);
            // Vagas eleinek azonositoi
            cutEdgeIds = cutEdges.map(ce => ce.id);
        }
        return new NetworkProperties(graph, errors, networkFlowValue, cutValue, cutEdgeIds);
    }

    /**
     * A halozat + folyam (esetleg vagas) megengedettseget ellenorzi.
     * @param {*} graph Az input halozat + folyam (esetleg vagas) (Graph tipusu).
     * @returns A hibakat tartalmazo tomb, amennyiben a folyam es/vagy a vagashoz megadott csucshalmaz nem megengedett, null egyebkent.
     */
    static validateNetworkAndCut(graph) {
        // Egy tombben gyujtuk ossze az esetlegesen talalt hibakat.
        var errors = [];
        // A forrast mindig az 1-gyel szamozott csuccsal jeloljuk, de az egyszerubb megertes miatt egy kulon konstanssal jeloljuk.
        const sourceNode = 1;
        // A nyelot mindig az utolso (legnagyobb szammal jelolt) csuccsal jeloljuk, de az egyszerubb megertes miatt egy kulon konstanst hasznalunk.
        const sinkNode = graph.numberOfNodes;

        // Minden elre ellenorizzuk az alabbiakat:
        for(var i = 0; i < graph.edges.length; i++){
            // ha az el kapacitasa kisebb, mint a folyam erteke az adott elen -> hiba
            if(graph.edges[i].capacity < graph.edges[i].flowValue){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_EDGE_CAPACITY + (i + 1) + "." ));
            }
            // ha valamelyik el a forrasba megy -> hiba
            if(graph.edges[i].toNode == sourceNode){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_EDGE_TO_SOURCE));
            }
            // ha valamelyik el a nyelobol indul ki -> hiba
            if(graph.edges[i].fromNode == sinkNode){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_EDGE_FROM_SINK));
            }
        }
        
        // Minden csucs eseten ellenorizzuk az alabbiakat (kiveve: forras es nyelo):
        for(var node = sourceNode + 1; node < sinkNode; node++){
            // bemeno, kimeno anyagmennyiseg kiszamitasa a csucsra
            var incomingFlow = this.#calculateFlow(node, graph.edges, true);
            var outgoingFlow = this.#calculateFlow(node, graph.edges, false);

            // ha nem annyi anyag folyik be, mint amennyi kifolyik -> hiba
            if(incomingFlow != outgoingFlow){
                errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_NODE + node + "."));
            }
        }

        // Forras: kell, hogy induljon belole legalabb egy el, ha nem -> hiba
        if(!graph.edges.some(edge => edge.fromNode == sourceNode)){
            errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_NO_EDGE_FROM_SOURCE));
        }

        // Nyelo: kell, hogy legyen legalabb egy el, ami bele van vezetve, ha nem -> hiba
        if(!graph.edges.some(edge => edge.toNode == sinkNode)){
            errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_NO_EDGE_TO_SINK));
        }

        // Izolalt csucsok - nincs olyan el amely az adott csuscsbol indul vagy bele lenne vezetve
        if(Array.from({length: graph.numberOfNodes}, (_, i) => i + 1)
            .some(node => !graph.edges.some(edge => edge.fromNode == node || edge.toNode == node))
        ){
            errors.push(new NetworkError(NetworkError.FLOW_ERROR, FLOW_ERROR_ISOLATED_NODE));
        }

        // Ha adunk meg csucshalmazt a vagashoz, a forras es a nyelo nem lehet egy halmazban
        if(graph.cutProvided){
            if(graph.cutSNodes.includes(1) && graph.cutSNodes.includes(graph.numberOfNodes)){
                errors.push(new NetworkError(NetworkError.CUT_ERROR, CUT_ERROR_SOURCE_SINK_IN_ONE_SET));
            }
        }

        // Ha nem talaltunk hibat, null-al terunk vissza ures tomb helyett
        return errors.length == 0 ? null : errors;
    }

    /**
     * Adott csucsra bearamlo/kiaramlo anyagmennyiseg szamitasa.
     * @param {*} node A csucs, amire az anyagmennyiseget szamoljuk (egesz szam).
     * @param {*} edges Az elek halmaza (Edge tomb).
     * @param {*} incoming Ha igaz, bemeno anyagmennyiseget szamolunk, ha hamis, akkor pedig kimenot (boolean).
     * @returns A kiszamitott anyagmennyiseg (egesz szam).
     */
    static #calculateFlow(node, edges, incoming){
        /* Ha az 'incoming' parameter igaz, akkor megkeressuk azokat az eleket, amelyek az adott csucsba mennek (edge.toNode == node).
           Ha az 'incoming' parameter hamis, akkor azokat az eleket nezzuk, amelyek az adott elbol indulnak ki (edge.fromNode == node).
           Ezeken az eleken veszem a hozzajuk tartozo folyam ertekeket, majd ezeket osszeadom.
        */
        return edges.filter(edge => (incoming ? edge.toNode : edge.fromNode) == node)
            .map(edge => edge.flowValue)
            .reduce((accumulator, flowValue) => accumulator + flowValue, 0);
    }

    /**
     * Meghatarozza, mely elek lesznek benne a vagasban.
     * @param {*} cutSNodes A graf ket csucshalmaza kozul az, amelyik a forrast (is) tartalmazza (egesz szamokat tartalmazo tomb).
     * @param {*} edges Az elek halmaza (Edge tomb).
     * @returns A vagas eleit tartalmazo tomb.
     */
    static #getCutEdges(cutSNodes, edges){
        var cutEdges = [];
        /* Vagast ugy lehet megadni, hogy a graf csucsait ket halmazra osztjuk fel, a forras es a nyelo kulon halmazban van. Ebbol a ket halmazbol kerjuk be valamelyiket.
           A 'cutSNodes' valtozoban tarolt csucshalmaz mindig az lesz, amelyik a forrast tartalmazza. Legyen ez X. Akkor ha a grafot G-vel jeloljuk, a masik csucshalmaz V(G)\X lesz.
           A vagas elei azok lesznek, amelyek X-bol V(G)\X-be vezetnek. Ha ezeket az eleket elhagynank, mar nem tudnank eljutni a forrasbol a nyelobe.*/
        edges.forEach(edge => {
            if(cutSNodes.includes(edge.fromNode) && !cutSNodes.includes(edge.toNode)){
                cutEdges.push(edge);
            }
        });
        return cutEdges;
    }
}

/**
 * Egy talalt hibat reprezentalo osztaly.
 */
export class NetworkError{
    /**
     * Folyammal kapcsolatos hiba.
     */
    static FLOW_ERROR = 0;
    /**
     * Vagassal kapcsolatos hiba.
     */
    static CUT_ERROR = 1;
    /**
     * A NetworkError osztaly konstruktora.
     * @param {*} type A hiba tipusa (FLOW_ERROR vagy CUT_ERROR).
     * @param {*} message A hiba rovid leirasa.
     */
    constructor(type, message){
        this.type = type;
        this.message = message;
    }
}

const FLOW_ERROR_EDGE_CAPACITY = 'The capacity of the edge is less than the entered flow value on edge ';
const FLOW_ERROR_EDGE_TO_SOURCE = 'You cannot use edges directed to the source as a destination!';
const FLOW_ERROR_NO_EDGE_FROM_SOURCE = 'There is no edge starting from the source!';
const FLOW_ERROR_EDGE_FROM_SINK = 'You cannot use edges directed from the sink as a departure point!';
const FLOW_ERROR_NO_EDGE_TO_SINK = 'There is no edge directed to the sink!';
const FLOW_ERROR_NODE = 'The values of incoming and outgoing flow are not equal on node ';
const FLOW_ERROR_ISOLATED_NODE = 'You have an isolated node in the graph!';
const CUT_ERROR_SOURCE_SINK_IN_ONE_SET = 'Soucre and sink must be in seperate node sets!';