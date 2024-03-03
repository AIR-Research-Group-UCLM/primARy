import { useRef, useCallback, MouseEvent } from "react";
import ReactFlow, {
  Controls,
  useReactFlow,
  Background,
  ConnectionMode,
  MarkerType,
} from "reactflow";

import useProtocolStore from "@/hooks/store";
import RFFlowchartNode from "@/ui/protocols/flowchart/node";
import RFFlowChartEdge from "@/ui/protocols/flowchart/edge";
import { getOpposite } from "@/ui/protocols/flowchart/handle";

import type {
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
} from "reactflow";

import type { HandlePosition } from "@/ui/protocols/flowchart/handle";
import type { FlowchartNode } from "@/ui/protocols/flowchart/node";
import type { FlowchartEdge } from "@/ui/protocols/flowchart/edge";

import "reactflow/dist/style.css";
import { nanoid } from "nanoid";

let id = 10;
const getId = () => `${id++}`;

type NodeHandle = {
  nodeId: string;
  handleId: HandlePosition;
}

type OnNodeClick = (event: MouseEvent, node: FlowchartNode) => void;
type OnPaneClick = (event: MouseEvent) => void;
type OnEdgeClick = (event: MouseEvent, edge: FlowchartEdge) => void;

const edgeTypes = {
  "flowchart-edge": RFFlowChartEdge
}

const nodeTypes = {
  "flowchart-node": RFFlowchartNode
}

function isEventTargetPane(target: Element): boolean {
  return target.classList.contains("react-flow__pane");
}

export default function FlowChartEditor() {
  const nodes = useProtocolStore((state) => state.nodes);
  const edges = useProtocolStore((state) => state.edges);
  const selectedNodeId = useProtocolStore((state) => state.selectedNodeId);

  const onNodesChange = useProtocolStore((state) => state.onNodesChange);
  const onEdgesChange = useProtocolStore((state) => state.onEdgesChange);
  const addEdgeFromConnection = useProtocolStore((state) => state.addEdgeFromConnection);
  const addNode = useProtocolStore((state) => state.addNode);
  const addEdge = useProtocolStore((state) => state.addEdge);
  const setSelectedNodeId = useProtocolStore((state) => state.setSelectedNodeId);
  const changeEdgeData = useProtocolStore((state) => state.changeEdgeData);
  const changeNode = useProtocolStore((state) => state.changeNode);

  const connectingNode = useRef<NodeHandle | null>(null);
  const selectedEdgeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback((connection) => {
    connectingNode.current = null;
    addEdgeFromConnection(connection);
  }, [addEdgeFromConnection]);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId }) => {
    if (nodeId === null || handleId === null) {
      return;
    }

    connectingNode.current = {
      nodeId,
      handleId: handleId as HandlePosition,
    };
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback((event) => {
    if (connectingNode.current === null || !isEventTargetPane(event.target as Element)) {
      return;
    }

    let id = nanoid();

    let newNode: FlowchartNode = {
      id,
      position: screenToFlowPosition({
        // @ts-ignore
        x: event.clientX,
        // @ts-ignore
        y: event.clientY
      }),
      data: { isSelectedModification: false },
      type: "flowchart-node",
    };

    let newEdge: FlowchartEdge = {
      id: nanoid(),
      source: connectingNode.current.nodeId,
      sourceHandle: connectingNode.current.handleId,
      targetHandle: getOpposite(connectingNode.current.handleId),
      target: id,
    }
    addNode(newNode, {
      name: "",
      description: ""
    });
    addEdge(newEdge);
  }, [screenToFlowPosition]);

  const onNodeClick: OnNodeClick = useCallback((_, node) => {
    if (selectedNodeId !== null) {
      changeNode(selectedNodeId, { data: { isSelectedModification: false } });
      changeNode(node.id, { data: { isSelectedModification: true } });
      setSelectedNodeId(node.id);
    }
  }, [selectedNodeId]);

  const onNodeDoubleClick: OnNodeClick = useCallback((_, node) => {
    changeNode(node.id, { data: { isSelectedModification: true } });
    setSelectedNodeId(node.id);
  }, []);

  const onEdgeDoubleClick: OnEdgeClick = useCallback((_, edge) => {
    if (selectedEdgeId.current !== null) {
      changeEdgeData(selectedEdgeId.current, { doubleClickSelected: false });
    }
    selectedEdgeId.current = edge.id;
    changeEdgeData(edge.id, { doubleClickSelected: true });
  }, []);

  const onPaneClick: OnPaneClick = useCallback((e) => {
    if (!isEventTargetPane(e.target as Element)) {
      return;
    }

    if (selectedEdgeId.current !== null) {
      changeEdgeData(selectedEdgeId.current, { doubleClickSelected: false })
      selectedEdgeId.current = null;
    }

    if (connectingNode.current === null) {
      if (selectedNodeId !== null) {
        changeNode(selectedNodeId, { data: { isSelectedModification: false } })
      }
      setSelectedNodeId(null);
    } else {
      connectingNode.current = null;
    }

  }, [selectedNodeId]);

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
      onEdgeDoubleClick={onEdgeDoubleClick}
      defaultEdgeOptions={{
        type: "flowchart-edge",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "black"
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