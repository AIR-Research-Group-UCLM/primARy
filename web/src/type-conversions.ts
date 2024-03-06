import type { Protocol, Position } from "@/types";
import type { ProtocolData } from "./hooks/store";

export function protocolToProtocolData(protocol: Protocol): ProtocolData {
  return {
    name: protocol.name,
    nodes: protocol.nodes.map((node) => ({
      id: node.id,
      data: { isSelectedModification: false },
      position: node.position,
      type: "flowchart-node"
    })),
    edges: protocol.edges.map((edge) => ({
      // TODO: change this
      id: `${protocol.id}${edge.source}${edge.target}`,
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

export function protocolDataToProtocol(protocolId: number, protocolData: ProtocolData): Protocol {
  return {
    id: protocolId,
    name: protocolData.name,
    nodes: protocolData.nodes.map((node) => ({
      id: node.id,
      position: node.position as Position,
      data: protocolData.nodesData.get(node.id)!
    })),
    edges: protocolData.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      label: edge.data?.label ?? "",
      sourceHandle: edge.sourceHandle!,
      targetHandle: edge.targetHandle!,
    }))
  };
}