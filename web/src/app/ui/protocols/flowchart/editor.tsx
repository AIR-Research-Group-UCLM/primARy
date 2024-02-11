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

type NodeHandle = {
    node: Node<FlowChartNodeData>;
    handleId: HandlePosition;
}

type OnNodeClick = (event: MouseEvent, node: Node<FlowChartNodeData>) => void;
type OnPaneClick = (event: MouseEvent) => void;

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
    addEdge: state.addEdge,
    selectedNode: state.selectedNode,
    setSelectedNode: state.setSelectedNode,
    changeNode: state.changeNode
});

function isEventTargetPane(target: Element): boolean {
    return target.classList.contains("react-flow__pane");
}

export default function FlowChartEditor() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        addEdgeFromConnection,
        addNode,
        addEdge,
        setSelectedNode,
        selectedNode
    } = useStore(
        useShallow(selector)
    );
    const connectingNode = useRef<NodeHandle | null>(null);
    const { screenToFlowPosition } = useReactFlow();

    const onConnect: OnConnect = useCallback(
        (connection) => {
            connectingNode.current = null;
            addEdgeFromConnection(connection);
        },
        [addEdgeFromConnection]);

    const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId }) => {
        if (nodeId === null || handleId === null) {
            return;
        }
        // TODO: find a way of making this faster. The most straightforward way is changing
        // the data structure from an array to a HashMap
        const node = nodes.find((node) => node.id === nodeId) as Node<FlowChartNodeData>;
        connectingNode.current = {
            node,
            handleId: handleId as HandlePosition,
        };
    }, [nodes]);

    const onConnectEnd: OnConnectEnd = useCallback((event) => {
        if (connectingNode.current === null || !isEventTargetPane(event.target as Element)) {
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
        let newEdge: Edge = {
            id,
            source: connectingNode.current.node.id,
            sourceHandle: connectingNode.current.handleId,
            targetHandle: getOpposite(connectingNode.current.handleId),
            target: id,
        }
        addNode(newNode);
        addEdge(newEdge);
    }, [screenToFlowPosition])

    const onNodeClick: OnNodeClick = useCallback((_, node) => {
        if (selectedNode !== null) {
            setSelectedNode(node);
        }
    }, [selectedNode]);

    const onNodeDoubleClick: OnNodeClick = useCallback((_, node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick: OnPaneClick = useCallback((e) => {
        if (!isEventTargetPane(e.target as Element)) {
            return;
        }

        if (connectingNode.current === null) {
            setSelectedNode(null);
        } else {
            connectingNode.current = null;
        }

    }, [nodes]);

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
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
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