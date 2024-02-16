
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
  nodesData: Map<string, FlowchartNodeData>;

  selectedNodeId: string | null;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addEdgeFromConnection: OnConnect;
  addNode: (node: FlowchartNode, nodeData: FlowchartNodeData) => void;
  addEdge: (edge: FlowchartEdge) => void;
  setSelectedNodeId: (selectedNodeId: string | null) => void;

  changeNode: (nodeId: string, nodeData: Partial<FlowchartNode>) => void;
  changeNodeData: (nodeId: string, nodeData: Partial<FlowchartNodeData>) => void;
  changeEdgeData: (edgeId: string, edgeData: Partial<FlowchartEdgeData>) => void;
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
  nodesData: new Map([["1", { name: "Initial Node", description: null }]]),
  selectedNodeId: null,

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
    const nodesData = new Map(get().nodesData);
    nodesData.set(node.id, nodeData);

    set((state) => ({
      nodes: [...state.nodes, node],
      nodesData
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
            ...defaultEdgeData,
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
    const nodesData = new Map(get().nodesData);
    const previousData = nodesData.get(nodeId);
    if (previousData == null) {
      throw new Error(`Node ID ${nodeId} does not exist`);
    }

    nodesData.set(nodeId, { ...previousData, ...nodeData });

    set({ nodesData });
  }
}));

export default useStore;