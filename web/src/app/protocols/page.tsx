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
  HandleProps,
} from "reactflow";

import 'reactflow/dist/style.css';

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
    position: { x: 250, y: 25 },
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
  const size = position === Position.Left || position == Position.Right ? {
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

function FlowChartEditor() {
  const connectingNodeId = useRef<NodeHandleId | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
      setEdges((eds: Edge[]) => addEdge(newConnection, eds));
    },
    [setEdges]);

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

    // TODO: find the way of correctly typeching this
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


    setNodes((nds: Node[]) => nds.concat(newNode));
    setEdges((eds: Edge[]) => eds.concat(newEdge));

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