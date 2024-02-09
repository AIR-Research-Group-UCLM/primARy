
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from "reactflow";

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

import { create } from "zustand";

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addEdgeFromConnection: OnConnect;
  addNode: (node: Node) => void
  addEdge: (edge: Edge) => void
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
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  addEdgeFromConnection: (connection: Connection) => {
    set(state => ({
      edges: addEdge(connection, state.edges)
    }))
  },
  addEdge: (edge: Edge) => {
    set(state => ({edges: [...state.edges, edge]}))
  },
  addNode: (node: Node) => {
    set(state => ({nodes: [...state.nodes, node]}))
  }
}));

export default useStore;