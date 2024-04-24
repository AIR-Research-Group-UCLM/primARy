import type { Protocol, Position, Edge } from "@/types";
import type { ProtocolData } from "./hooks/store";
import { FlowchartEdge } from "./ui/protocols/flowchart/edge";

export function protocolToProtocolData(protocol: Protocol): ProtocolData {
  return {
    name: protocol.name,
    initialNodeId: protocol.initialNodeId,
    nodes: protocol.nodes.map((node) => ({
      id: node.id,
      data: { isSelectedModification: false },
      position: node.position,
      type: "flowchart-node"
    })),
    edges: protocol.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      data: {
        doubleClickSelected: false,
        label: edge.label
      }
    })),
    nodesData: new Map(protocol.nodes.map((node) => [node.id, node.data]))
  };
}

export function flowchartEdgeToEdge(edge: FlowchartEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.data?.label ?? "",
    sourceHandle: edge.sourceHandle!,
    targetHandle: edge.targetHandle!,
  }
}

export function protocolDataToProtocol(protocolId: string, protocolData: ProtocolData): Protocol {
  return {
    id: protocolId,
    initialNodeId: protocolData.initialNodeId,
    name: protocolData.name,
    nodes: protocolData.nodes.map((node) => ({
      id: node.id,
      position: node.position as Position,
      data: protocolData.nodesData.get(node.id)!
    })),
    edges: protocolData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.data?.label ?? "",
      sourceHandle: edge.sourceHandle!,
      targetHandle: edge.targetHandle!,
    }))
  };
}