import { useRef, useCallback, MouseEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import ReactFlow, {
  Controls,
  useReactFlow,
  Background,
  ConnectionMode,
  MarkerType,
} from "reactflow";

import useStore from "@/hooks/store";
import RFFlowchartNode from "@/ui/protocols/flowchart/node";
import RFFlowChartEdge from "@/ui/protocols/flowchart/edge";
import { getOpposite } from "@/ui/protocols/flowchart/handle";

import type {
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
} from "reactflow";
import type { RFState } from "@/hooks/store";
import type { HandlePosition } from "@/ui/protocols/flowchart/handle";
import type { FlowchartNode } from "@/ui/protocols/flowchart/node";
import type { FlowchartEdge } from "@/ui/protocols/flowchart/edge";

import "reactflow/dist/style.css";

let id = 2;
const getId = () => `${id++}`;

type NodeHandle = {
  node: FlowchartNode;
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

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  selectedNodeId: state.selectedNodeId,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addEdgeFromConnection: state.addEdgeFromConnection,
  addNode: state.addNode,
  addEdge: state.addEdge,
  setSelectedNodeId: state.setSelectedNodeId,
  changeNodeData: state.changeNodeData,
  changeEdgeData: state.changeEdgeData,
  changeNode: state.changeNode
});

function isEventTargetPane(target: Element): boolean {
  return target.classList.contains("react-flow__pane");
}

export default function FlowChartEditor() {
  const {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    addEdgeFromConnection,
    addNode,
    addEdge,
    setSelectedNodeId,
    changeEdgeData,
    changeNode
  } = useStore(
    useShallow(selector)
  );
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
    // TODO: find a way of making this faster. The most straightforward way is changing
    // the data structure from an array to a HashMap
    const node = nodes.find((node) => node.id === nodeId) as FlowchartNode;
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

    // TODO: think on a better id for the edge
    let newEdge: FlowchartEdge = {
      id,
      source: connectingNode.current.node.id,
      sourceHandle: connectingNode.current.handleId,
      targetHandle: getOpposite(connectingNode.current.handleId),
      target: id,
    }
    addNode(newNode, {
      name: `Node ${id}`,
      description: null
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