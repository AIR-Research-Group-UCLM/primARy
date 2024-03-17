import type { NodeResource, ProtocolSummary, Node, ProtocolUpsert } from "@/types";
import type { ProtocolData } from "@/hooks/store";

import { protocolDataToProtocol } from "@/type-conversions";
import useMutate from "./hooks/useMutate";
import { JSONfetcher } from "@/utils";

async function createProtocol({ name }: { name: string }): Promise<ProtocolSummary> {
  return JSONfetcher(`${process.env.API_BASE}/protocols`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });
}

async function deleteProtocol({ protocolId }: { protocolId: number }) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}`, {
    method: "DELETE"
  });
}

export async function createNode({ protocolId, node }: { protocolId: number, node: Node }) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/nodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(node)
  })
}

async function updateProtocol(
  { protocolId, protocolData }: { protocolId: number; protocolData: ProtocolData }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(protocolDataToProtocol(protocolId, protocolData))
  });
}

async function uploadFiles(
  { protocolId, nodeId, formData }: { protocolId: number; nodeId: string; formData: FormData }
) {
  return JSONfetcher<NodeResource[]>(`${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}/resources`, {
    method: "POST",
    body: formData
  })
}

async function changeResourceName(
  { protocolId, nodeId, resourceId, name }: { protocolId: number; nodeId: string; resourceId: number; name: string }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}/resources/${resourceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  })
}

export async function deleteNodes(
  { protocolId, nodesIds }: { protocolId: number, nodesIds: string[] }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/nodes`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(nodesIds)
  });
}

export async function upsertProtocol(
  {protocolId, protocol} : {protocolId: number; protocol: ProtocolUpsert}
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(protocol)
  });
}

export async function deleteEdges(
  { protocolId, edgesIds }: { protocolId: number; edgesIds: string[] }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/edges`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(edgesIds)
  });
}

export async function deleteNodeResource(
  { protocolId, nodeId, resourceId }: { protocolId: number; nodeId: string; resourceId: number }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}/resources/${resourceId}`, {
    method: "DELETE"
  });
}

// TODO: You can achieve the same using deleteNodes. Think if I should leave this endpoint
// The same happens with deleteEdge and deleteEdges
export async function deleteNode(
  { protocolId, nodeId }: { protocolId: number; nodeId: string }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}`, {
    method: "DELETE"
  })
}

export function useUploadFiles() {
  const { trigger, isMutating } = useMutate(uploadFiles);
  return {
    triggerUploadFiles: trigger,
    isUploadingFiles: isMutating
  }
}

export function useChangeResourceName() {
  const { trigger, isMutating } = useMutate(changeResourceName);
  return {
    triggerChangeResourceName: trigger,
    isChangingResourceName: isMutating
  }
}

export function useCreateProtocol() {
  const { trigger, isMutating } = useMutate(createProtocol);
  return {
    triggerCreateProtocol: trigger,
    isCreatingProtocol: isMutating
  }
}

export function useDeleteProtocol() {
  const { trigger, isMutating } = useMutate(deleteProtocol);
  return {
    triggerDeleteProtocol: trigger,
    isDeletingProtocol: isMutating
  }
}

export function useUpdateProtocol() {
  const { trigger, isMutating } = useMutate(updateProtocol);
  return {
    triggerUpdateProtocol: trigger,
    isUpdatingProtocol: isMutating
  }
}