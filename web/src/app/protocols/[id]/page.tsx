import { ProtocolData } from "@/hooks/store";
import ProtocolStoreProvider from "@/ui/protocols/store-provider";
import ProtocolView from "@/ui/protocols/view";
import { defaultEdgeData } from "@/ui/protocols/defaults";

import type { Protocol } from "@/types";

export default async function Page({ params }: { params: { id: string } }) {
  // TODO: add error handling
  const request = await fetch(`${process.env.API_BASE}/protocols/${params.id}`, { cache: "no-store" });
  const data: Protocol = await request.json();

  const protocol: ProtocolData = {
    id: data.id,
    name: data.name,
    nodes: data.nodes.map((node) => ({
      id: node.id,
      data: { isSelectedModification: false },
      position: node.position,
      type: "flowchart-node"
    })),
    edges: data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      data: {
        ...defaultEdgeData,
        label: edge.label,
      }
    })),
    nodesData: new Map(data.nodes.map((node) => [node.id, node.data]))
  };

  return (
    <ProtocolStoreProvider protocol={protocol}>
      <ProtocolView />
    </ProtocolStoreProvider>
  );
}