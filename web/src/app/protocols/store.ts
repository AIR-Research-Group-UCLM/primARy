
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from "reactflow";

import { create } from "zustand";

import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  OnConnect,
  Connection,
} from "reactflow";

import type { FlowChartNodeData } from "@/app/ui/protocols/flowchart/node";
import type { FlowChartEdgeData } from "@/app/ui/protocols/flowchart/edge";

type FlowChartNode = Node<FlowChartNodeData>;
type FlowChartEdge = Edge<FlowChartEdgeData>;

export type RFState = {
  nodes: FlowChartNode[];
  edges: FlowChartEdge[];
  selectedNode: FlowChartNode | null;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addEdgeFromConnection: OnConnect;
  addNode: (node: FlowChartNode) => void;
  addEdge: (edge: FlowChartEdge) => void;
  changeEdgeLabel: (edgeId: string, label: string) => void;
  setSelectedNode: (selectedNode: FlowChartNode | null) => void;
  changeNode: (node: FlowChartNode) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: "1",
      type: 'flowchart-node',
      data: { label: "Initial Node" },
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
  changeEdgeLabel: (edgeId, label) => {
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...edge.data, label } };
        }
        return edge;
      })
    }));
  },
  setSelectedNode: (selectedNode) => {
      set({selectedNode})
  },
  changeNode: (updatedNode) => {
    set((state) => ({
      nodes: state.nodes.map((node) => node.id === updatedNode.id ? updatedNode : node)
    }));
  }
}));

export default useStore;