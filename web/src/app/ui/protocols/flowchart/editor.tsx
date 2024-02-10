import { useRef, useCallback, MouseEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import ReactFlow, {
    Controls,
    useReactFlow,
    Background,
    ConnectionMode,
    MarkerType,
} from "reactflow";

import useStore from "@/app/protocols/store";
import FlowChartNode, { FlowChartNodeData } from "@/app/ui/protocols/flowchart/node";
import FlowChartEdge from "@/app/ui/protocols/flowchart/edge";
import { getOpposite } from "@/app/ui/protocols/flowchart/handle";

import type {
    OnConnect,
    OnConnectStart,
    Edge,
    Node,
    OnConnectEnd,
} from "reactflow";
import type { RFState } from "@/app/protocols/store";
import type { HandlePosition } from "@/app/ui/protocols/flowchart/handle";

import "reactflow/dist/style.css";


let id = 2;
const getId = () => `${id++}`;

type NodeHandleId = {
    nodeId: string;
    handleId: HandlePosition;
}

const edgeTypes = {
    "flowchart-edge": FlowChartEdge
}

const nodeTypes = {
    "flowchart-node": FlowChartNode
}

const selector = (state: RFState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    addEdgeFromConnection: state.addEdgeFromConnection,
    addNode: state.addNode,
    addEdge: state.addEdge
});

export default function FlowChartEditor() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        addEdgeFromConnection,
        addNode,
        addEdge
    } = useStore(
        useShallow(selector)
    );
    const connectingNodeId = useRef<NodeHandleId | null>(null);

    const { screenToFlowPosition } = useReactFlow();

    const onConnect: OnConnect = useCallback(
        (connection) => {
            connectingNodeId.current = null;
            addEdgeFromConnection(connection);
        },
        [addEdgeFromConnection]);

    const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId }) => {
        if (nodeId === null || handleId === null) {
            return;
        }
        connectingNodeId.current = { nodeId, handleId: handleId as HandlePosition };
    }, []);

    const onConnectEnd: OnConnectEnd = useCallback((event) => {
        if (connectingNodeId.current == null) {
            return;
        }

        const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
        if (!targetIsPane) {
            return;
        }

        let id = getId();

        // TODO: find the way of correctly typechecking this
        let newNode: Node = {
            id,
            position: screenToFlowPosition({
                // @ts-ignore
                x: event.clientX,
                // @ts-ignore
                y: event.clientY
            }),
            data: { label: `Node ${id}` },
            type: "flowchart-node",
        };

        // TODO: think on a better id for the edge
        // TODO: can we avoid the exclamation mark??? maybe using a predicate
        let newEdge: Edge = {
            id,
            source: connectingNodeId.current!.nodeId,
            sourceHandle: connectingNodeId.current!.handleId,
            targetHandle: getOpposite(connectingNodeId.current!.handleId),
            target: id,
        }
        addNode(newNode);
        addEdge(newEdge);

    }, [screenToFlowPosition])

    const onNodeDoubleClick = useCallback<(event: MouseEvent, node: Node<FlowChartNodeData>) => void>((_, node) => {
        console.log(node);
    }, []);

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
            nodeTypes={nodeTypes}
            onNodeDoubleClick={onNodeDoubleClick}
            defaultEdgeOptions={{
                type: "flowchart-edge",
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 50,
                    height: 50
                }
            }}
            proOptions={{
                hideAttribution: true
            }}
            connectionMode={ConnectionMode.Loose}
            fitView
        >
            <Controls />
            <Background />
        </ReactFlow>
    );
}