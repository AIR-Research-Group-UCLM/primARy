"use client";

import { useRef, useCallback, MouseEvent } from "react";

import TextField from "@mui/material/TextField";

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
  EdgeLabelRenderer,
  Position,
  Handle,
  ConnectionMode,
  MarkerType,
} from "reactflow";

import type {
  OnConnect,
  OnConnectStart,
  Edge,
  Node,
  OnConnectEnd,
  EdgeProps,
  NodeProps,
} from "reactflow";

import 'reactflow/dist/style.css';

import useStore from "@/app/protocols/store";
import type { RFState } from "@/app/protocols/store";
import {shallow} from "zustand/shallow";

let id = 2;
const getId = () => `${id++}`;

interface NodeHandleId {
  nodeId: string;
  handleId: HandlePosition;
}

type HandlePosition = "top" | "bottom" | "left" | "right";

const initialNodes = [
  {
    id: "1",
    data: { label: "Initial Node" },
    position: { x: 0, y: 0 },
    type: "flowchart-node"
  }
];

const opposite = {
  "top": "bottom",
  "bottom": "top",
  "left": "right",
  "right": "left"
}

function getOpposite(position: HandlePosition) {
  return opposite[position];
}

function FlowChartHandle({ position, id }: { position: Position, id: string }) {
  const isHorizontal = position === Position.Left || position === Position.Right;

  const size = isHorizontal ? {
    width: "2px",
    height: "20px"
  } : {
    width: "25px",
    height: "2px"
  };

  return (
    <Handle type="source" position={position} id={id} style={{
      ...size,
      borderRadius: "3px",
      background: "#000000",
    }} />
  )
}

function FlowChartNode({ data }: NodeProps) {
  return (
    <>
      <FlowChartHandle position={Position.Top} id="top" />
      <FlowChartHandle position={Position.Left} id="left" />
      <FlowChartHandle position={Position.Bottom} id="bottom" />
      <FlowChartHandle position={Position.Right} id="right" />

      <div style={{
        padding: "10px 20px",
        background: "#ffffff",
        border: "solid 2px",
        borderRadius: 10,
      }}>
        {data.label}
      </div>
    </>
  );
}

function FlowChartEdge({ id, data, markerEnd, ...props }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath(props);

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <TextField
          inputProps={{
            style: {
              padding: "2.5px 5px",
              textAlign: "center"
            }
          }}
          defaultValue={data.label}
          variant="outlined"
          size="small"
          sx={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            textAlign: "center",
            background: "#ffffff",
            width: "75px"
          }} />
      </EdgeLabelRenderer>
    </>
  );
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

function FlowChartEditor() {
  // TODO: solve this deprecation warning
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addEdgeFromConnection,
    addNode,
    addEdge
  } = useStore(
    selector,
    shallow,
  );
  const connectingNodeId = useRef<NodeHandleId | null>(null);

  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    connection => {
      connectingNodeId.current = null;
      const newConnection = {
        ...connection,
        data: {
          label: ""
        }
      }
      addEdgeFromConnection(newConnection);
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
      data: {
        label: ""
      },
    }
    addNode(newNode);
    addEdge(newEdge);

  }, [screenToFlowPosition])

  const onEdgeDoubleClick = useCallback<(event: MouseEvent, edge: Edge) => void>((_, edge: Edge) => {
    console.log(edge);
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
      onEdgeDoubleClick={onEdgeDoubleClick}
      defaultEdgeOptions={{
        type: "flowchart-edge",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 50,
          height: 50
        }
      }}
      connectionMode={ConnectionMode.Loose}
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