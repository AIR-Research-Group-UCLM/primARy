
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

import { defaultEdgeData } from "@/app/ui/protocols/flowchart/edge";

import type { FlowchartNode, FlowchartNodeData } from "@/app/ui/protocols/flowchart/node";
import type { FlowchartEdge, FlowchartEdgeData } from "@/app/ui/protocols/flowchart/edge";

export type RFState = {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];

  // TODO: we are only interested in its id and data so to avoid confusions
  // we should create a new type which has those properties
  selectedNode: FlowchartNode | null;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addEdgeFromConnection: OnConnect;
  addNode: (node: FlowchartNode) => void;
  addEdge: (edge: FlowchartEdge) => void;
  setSelectedNode: (selectedNode: FlowchartNode | null) => void;

  changeEdgeData: (edgeId: string, edgeData: Partial<FlowchartEdgeData>) => void;
  changeNodeData: (nodeId: string, nodeData: Partial<FlowchartNodeData>) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: "1",
      type: 'flowchart-node',
      data: { name: "Initial Node", description: null, isSelectedModification: false },
      position: { x: 0, y: 0 },
    },
  ],
  edges: [],
  selectedNode: null,
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
    }))
  },
  addEdge: (edge) => {
    set((state) => ({ edges: [...state.edges, edge] }))
  },
  addNode: (node) => {
    set((state) => ({ nodes: [...state.nodes, node] }))
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
            ...defaultEdgeData,
            ...edge.data,
            ...edgeData
          }
        };
      })
    }));
  },
  setSelectedNode: (selectedNode) => {
    set({ selectedNode })
  },
  changeNodeData: (nodeId, nodeData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            ...nodeData
          }
        }
      })
    }));
  }
}));

export default useStore;