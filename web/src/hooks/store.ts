
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from "reactflow";

import { create } from "zustand";

import type {
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  OnConnect,
  Connection,
} from "reactflow";

import type { NodeData } from "@/types";

import type { FlowchartNode } from "@/ui/protocols/flowchart/node";
import type { FlowchartEdge, FlowchartEdgeData } from "@/ui/protocols/flowchart/edge";

export type ProtocolData = {
  name: string;
  initialNodeId: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  nodesData: Map<string, NodeData>;
}

export type ProtocolActions = {
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addEdgeFromConnection: OnConnect;
  addNode: (node: FlowchartNode, nodeData: NodeData) => void;
  addEdge: (edge: FlowchartEdge) => void;
  setSelectedNodeId: (selectedNodeId: string | null) => void;

  changeName: (name: string) => void;
  changeNode: (nodeId: string, nodeData: Partial<FlowchartNode>) => void;
  changeNodeData: (nodeId: string, nodeData: Partial<NodeData>) => void;
  changeEdgeData: (edgeId: string, edgeData: Partial<FlowchartEdgeData>) => void;
  changeInitialNodeId: (string: string) => void;
}

export type ProtocolState = ProtocolData & ProtocolActions & {
  selectedNodeId: string | null;
}

export const defaultProtocolState = {
  name: "",
  initialNodeId: "",
  nodes: [],
  edges: [],
  nodesData: new Map(),
  selectedNodeId: null
}

const useProtocolStore = create<ProtocolState>((set, get) => ({
  ...defaultProtocolState,

  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, get().edges),
    }));
  },
  addEdgeFromConnection: (connection: Connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges)
    }));
  },
  addEdge: (edge) => {
    set((state) => ({ edges: [...state.edges, edge] }));
  },
  addNode: (node, nodeData) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      nodesData: new Map(state.nodesData).set(node.id, nodeData)
    }));
  },
  changeEdgeData: (edgeId, edgeData) => {
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id !== edgeId) {
          return edge;
        }
        return {
          ...edge,
          data: {
            doubleClickSelected: false,
            label: "",
            ...edge.data,
            ...edgeData
          }
        };
      })
    }));
  },
  setSelectedNodeId: (selectedNodeId) => {
    set({ selectedNodeId })
  },
  changeNode(nodeId, nodeData) {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (nodeId !== node.id) {
          return node;
        }
        return {
          ...node,
          ...nodeData
        };
      })
    }));
  },
  changeNodeData: (nodeId, nodeData) => {
    const previousData = get().nodesData.get(nodeId);
    if (previousData == null) {
      throw new Error(`Node ID ${nodeId} does not exist`);
    }

    set((state) => ({
      nodesData: new Map(state.nodesData).set(nodeId, { ...previousData, ...nodeData })
    }));
  },
  changeName(name) {
    set({ name });
  },
  changeInitialNodeId(initialNodeId: string) {
    set({initialNodeId});
  }
}));

export default useProtocolStore;