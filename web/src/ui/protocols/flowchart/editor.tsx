import { useRef, useCallback, MouseEvent, useState } from "react";
import ReactFlow, {
  Controls,
  useReactFlow,
  Background,
  ConnectionMode,
  MarkerType,
  getConnectedEdges
} from "reactflow";

import useProtocolStore from "@/hooks/store";
import RFFlowchartNode from "@/ui/protocols/flowchart/node";
import RFFlowChartEdge, { defaultEdgeData } from "@/ui/protocols/flowchart/edge";
import { getOpposite } from "@/ui/protocols/flowchart/handle";

import type {
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
  OnNodesChange,
  OnEdgesChange,
  Connection,
} from "reactflow";

import type { HandlePosition } from "@/ui/protocols/flowchart/handle";
import type { FlowchartNode } from "@/ui/protocols/flowchart/node";
import type { FlowchartEdge } from "@/ui/protocols/flowchart/edge";

import "reactflow/dist/style.css";
import { nanoid } from "nanoid";
import { deleteEdges, deleteNodes } from "@/mutation";
import useSaveEventsContext from "@/hooks/useSaveEventsContext";
import useToastMessageContext from "@/hooks/useToastMessageContext";
import useLocalEdgesNodes from "@/hooks/useLocalEdgesNodes";

type NodeHandle = {
  nodeId: string;
  handleId: HandlePosition;
}

type OnNodeClick = (event: MouseEvent, node: FlowchartNode) => void;
type OnPaneClick = (event: MouseEvent) => void;
type OnEdgeClick = (event: MouseEvent, edge: FlowchartEdge) => void;
type OnNodesDelete = (nodes: FlowchartNode[]) => void;
type IsValidConnection = (connection: Connection) => boolean;

const edgeTypes = {
  "flowchart-edge": RFFlowChartEdge
}

const nodeTypes = {
  "flowchart-node": RFFlowchartNode
}

function isEventTargetPane(target: Element): boolean {
  return target.classList.contains("react-flow__pane");
}

export default function FlowChartEditor({ protocolId }: { protocolId: string }) {
  const nodes = useProtocolStore((state) => state.nodes);
  const edges = useProtocolStore((state) => state.edges);
  const selectedNodeId = useProtocolStore((state) => state.selectedNodeId);
  const initialNodeId = useProtocolStore((state) => state.initialNodeId);

  const applyNodeChanges = useProtocolStore((state) => state.applyNodeChanges);
  const applyEdgeChanges = useProtocolStore((state) => state.applyEdgeChanges);
  const addEdgeFromConnection = useProtocolStore((state) => state.addEdgeFromConnection);
  const addNode = useProtocolStore((state) => state.addNode);
  const addEdge = useProtocolStore((state) => state.addEdge);
  const setSelectedNodeId = useProtocolStore((state) => state.setSelectedNodeId);
  const changeEdgeData = useProtocolStore((state) => state.changeEdgeData);
  const changeNode = useProtocolStore((state) => state.changeNode);
  const removeNodesData = useProtocolStore((state) => state.removeNodesData);

  const { localNodes, localEdges } = useLocalEdgesNodes();

  const { recordEvent, cancelEvent } = useSaveEventsContext();
  const setToastMessage = useToastMessageContext();

  const connectingNode = useRef<NodeHandle | null>(null);
  const selectedEdgeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  function canRemoveNode(nodeId: string): boolean {
    return nodes.length > 1 && nodeId !== initialNodeId;
  }

  function canRemoveEdge(edge: FlowchartEdge, removeCandidates: Set<string>) {
    return (
      !removeCandidates.has(edge.source) && !removeCandidates.has(edge.target) ||
      removeCandidates.has(edge.source) && canRemoveNode(edge.source) ||
      removeCandidates.has(edge.target) && canRemoveNode(edge.target)
    );
  }

  function updateSelectionAfterDelete(nodes: FlowchartNode[]) {
    if (selectedNodeId === null) {
      return;
    }
    const isSelectedDeleted = nodes.some((node) => node.id === selectedNodeId);
    if (isSelectedDeleted) {
      setSelectedNodeId(null);
    }
  }

  function onExplicitEdgesDelete(edges: FlowchartEdge[]) {
    const edgesIds = edges.map((edge) => edge.id).filter((edgeId) => !localEdges.isLocalId(edgeId));

    for (const edgeId of edgesIds) {
      cancelEvent({
        type: "edge",
        id: edgeId
      });
    }

    if (edgesIds.length > 0) {
      deleteEdges({ protocolId, edgesIds })
        .then(() => setToastMessage({
          type: "success",
          text: "Saved"
        }))
        .catch((error) => {
          setToastMessage({
            type: "error",
            text: `Could not delete edges: ${error}`
          })
          useProtocolStore.setState((state) => ({
            edges: [...state.edges, ...edges]
          }))
        }
        );
    }
  }

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    const allowedChanges = changes.filter((change) => (
      change.type !== "remove" || (change.type === "remove" && canRemoveNode(change.id))
    ));

    for (const allowedChange of allowedChanges) {
      if (allowedChange.type === "position" && allowedChange.dragging) {
        recordEvent({
          type: "node",
          id: allowedChange.id
        })
      }
    }

    applyNodeChanges(allowedChanges);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, initialNodeId]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    const nodeIds = nodes.filter((node) => node.selected).map((node) => node.id);
    const removeCandidates = new Set(nodeIds);
    const edgeMap = new Map(edges.map((edge) => [edge.id, edge]));

    const allowedChanges = changes.filter((change) => (
      (change.type !== "remove") ||
      (change.type === "remove" && canRemoveEdge(edgeMap.get(change.id)!, removeCandidates))
    ));

    const explicitlyDeleted = [];
    for (const allowedChange of allowedChanges) {
      if (allowedChange.type !== "remove") {
        continue;
      }
      const edge = edgeMap.get(allowedChange.id)!;

      if (!removeCandidates.has(edge.source) && !removeCandidates.has(edge.target)) {
        explicitlyDeleted.push(edge);
      }
    }
    if (explicitlyDeleted.length > 0) {
      onExplicitEdgesDelete(explicitlyDeleted);
    }
    applyEdgeChanges(allowedChanges);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const onConnect: OnConnect = useCallback((connection) => {
    connectingNode.current = null;
    const edgeId = nanoid();
    localEdges.addLocalId(edgeId);
    addEdgeFromConnection(connection, edgeId);
    recordEvent({
      type: "edge",
      id: edgeId
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isValidConnection: IsValidConnection = useCallback((connection) => {
    if (connection.target == null || connection.source == null ||
      connection.sourceHandle == null || connection.targetHandle == null) {
      return true;
    }
    return !edges.some((edge) =>
      edge.source === connection.target && edge.sourceHandle === connection.targetHandle
    );
  }, [edges]);

  const onConnectEnd: OnConnectEnd = useCallback((event) => {
    if (connectingNode.current === null || !isEventTargetPane(event.target as Element)) {
      return;
    }

    let nodeId = nanoid();

    let newNode: FlowchartNode = {
      id: nodeId,
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
      target: nodeId,
      data: {
        ...defaultEdgeData
      }
    }
    addNode(newNode, {
      name: "",
      description: ""
    });
    addEdge(newEdge);
    localNodes.addLocalId(newNode.id);
    localEdges.addLocalId(newEdge.id);
    recordEvent({
      type: "node",
      id: nodeId
    });
    recordEvent({
      type: "edge",
      id: newEdge.id
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenToFlowPosition]);

  const onNodeClick: OnNodeClick = useCallback((_, node) => {
    if (selectedNodeId !== null) {
      changeNode(selectedNodeId, { data: { isSelectedModification: false } });
      changeNode(node.id, { data: { isSelectedModification: true } });
      setSelectedNodeId(node.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  const onNodesDelete: OnNodesDelete = useCallback((nodes) => {
    updateSelectionAfterDelete(nodes);

    // Send request to the backend to delete these edges
    const allowedNodes = nodes.filter((node) => !localNodes.isLocalId(node.id) && canRemoveNode(node.id));
    const nodesIds = allowedNodes.map((node) => node.id);
    if (nodesIds.length === 0) {
      return;
    }

    const connectedEdges = getConnectedEdges(nodes, edges);

    // Ensure these edges are not marked to be modified
    for (const connectedEdge of connectedEdges) {
      cancelEvent({
        type: "edge",
        id: connectedEdge.id
      });
    }

    for (const nodeId of nodesIds) {
      cancelEvent({
        type: "node",
        id: nodeId
      });
    }

    deleteNodes({ protocolId, nodesIds })
      .then(() => {
        setToastMessage({
          type: "success",
          text: "Saved"
        })
        removeNodesData(nodesIds)
      })
      .catch((error) => {
        setToastMessage({
          type: "error",
          text: `Could not delete nodes: ${error}`
        })
        useProtocolStore.setState((state) => ({
          nodes: [...state.nodes, ...allowedNodes],
          edges: [...state.edges, ...connectedEdges]
        }));
      }
      );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId, edges]);

  const onNodeDoubleClick: OnNodeClick = useCallback((_, node) => {
    changeNode(node.id, { data: { isSelectedModification: true } });
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId, changeNode]);

  const onEdgeDoubleClick: OnEdgeClick = useCallback((_, edge) => {
    if (selectedEdgeId.current !== null) {
      changeEdgeData(selectedEdgeId.current, { doubleClickSelected: false });
    }
    selectedEdgeId.current = edge.id;
    changeEdgeData(edge.id, { doubleClickSelected: true });
  }, [changeEdgeData]);

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

  }, [changeEdgeData, selectedNodeId, setSelectedNodeId, changeNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodesDelete={onNodesDelete}
      isValidConnection={isValidConnection}
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