"use client";

import { useRef, useCallback } from "react";

import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    Controls,
    useReactFlow,
    Background,
    getBezierPath,
    BaseEdge,
    EdgeLabelRenderer
} from "reactflow";

import type {
    OnConnect,
    OnConnectStart,
    Edge,
    Node,
    OnConnectEnd,
    EdgeProps
} from "reactflow";

import 'reactflow/dist/style.css';

let id = 2;
const getId = () => `${id++}`;

const initialNodes = [
    {
        id: "1",
        data: { label: "Initial Node" },
        position: { x: 250, y: 25 }
    }
];

function FlowChartEdge({ id, data, ...props }: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath(props);

    return (
        <>
            <BaseEdge id={id} path={edgePath} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: '#ffcc00',
                        padding: 10,
                        borderRadius: 5,
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                    className="nodrag nopan"
                >
                    {data.label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

const edgeTypes = {
    "flowchart-edge": FlowChartEdge
}

function FlowChartEditor() {
    const connectingNodeId = useRef<string | null>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const { screenToFlowPosition } = useReactFlow();

    const onConnect: OnConnect = useCallback(
        connection => {
            connectingNodeId.current = null;
            setEdges((eds: Edge[]) => addEdge(connection, eds));
        },
        [setEdges]);

    const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectEnd: OnConnectEnd = useCallback((event) => {
        if (connectingNodeId.current == null) {
            return;
        }

        // TODO: find the way of correctly typeching this
        // @ts-ignore
        const targetIsPane = event.target.classList.contains('react-flow__pane');
        if (!targetIsPane) {
            return;
        }

        let id = getId();

        // TODO: find the way of correctly typeching this
        let newNode = {
            id,
            position: screenToFlowPosition({
                // @ts-ignore
                x: event.clientX,
                // @ts-ignore
                y: event.clientY
            }),
            data: { label: `Node ${id}` },
            origin: [0.5, 0]
        };

        setNodes((nds: Node[]) => nds.concat(newNode));

        // TODO: think on a better id for the edge
        // TODO: can we avoid the exclamation mark??? maybe using a predicate
        setEdges((eds: Edge[]) =>
            eds.concat({ id, source: connectingNodeId.current!, target: id, type: "flowchart-edge", data: { label: "texto" } })
        );
    }, [screenToFlowPosition])

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            panOnScroll
            selectionOnDrag
            nodeOrigin={[0.5, 0]}
            edgeTypes={edgeTypes}
            fitView
        >
            <Controls />
            <Background />
        </ReactFlow>
    );

}

export default function Page() {
    return (
        <div style={{ height: "100%", border: "solid" }}>
            <ReactFlowProvider>
                <FlowChartEditor />
            </ReactFlowProvider>
        </div>
    );
}