import type { UserFile, ProtocolSummary, Node, ProtocolUpsert, LLMResponse } from "@/types";
import type { ProtocolData } from "@/hooks/store";

import { protocolDataToProtocol } from "@/type-conversions";
import useMutate, { UseMutate } from "./hooks/useMutate";
import { JSONfetcher, fetcher } from "@/utils";

import { splitStream, parseJSON } from "@/stream-transformers";

export async function generateLLMResponse({ prompt, protocolId }: { prompt: string, protocolId?: number }): Promise<ReadableStream<LLMResponse>> {
  const queryParams = protocolId !== undefined ? `?protocol=${protocolId}` : "";

  // TODO: this will work with process.env.API_BASE because it will reference a 
  // reverse proxy which will deliver the request to the llm service
  const response = await fetcher(`http://127.0.0.1:8001/llm/generate${queryParams}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const stream = response.body?.pipeThrough(new TextDecoderStream())
    .pipeThrough(splitStream("\n"))
    .pipeThrough(parseJSON<LLMResponse>());

  if (stream == null) {
    throw new Error("The body is empty");
  }

  return stream;
}

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
  });
}

async function updateProtocol(
  { protocolId, protocolData }: { protocolId: string; protocolData: ProtocolData }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(protocolDataToProtocol(protocolId, protocolData))
  });
}

async function uploadDocs(
  { protocolId, formData }: { protocolId: string; formData: FormData }
) {
  return JSONfetcher<UserFile[]>(`${process.env.API_BASE}/protocols/${protocolId}/docs`, {
    method: "POST",
    body: formData
  });
}

async function changeDocName(
  { protocolId, docId, name }: { protocolId: string; docId: string; name: string }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/docs/${docId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });
}

async function deleteDoc(
  { protocolId, docId }: { protocolId: string; docId: string }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/docs/${docId}`, {
    method: "DELETE"
  });
}

async function uploadNodeResources(
  { protocolId, nodeId, formData }: { protocolId: number; nodeId: string; formData: FormData }
) {
  console.log(formData);
  return JSONfetcher<UserFile[]>(`${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}/resources`, {
    method: "POST",
    body: formData
  });
}

async function changeResourceName(
  { protocolId, nodeId, resourceId, name }: { protocolId: string; nodeId: string; resourceId: string; name: string }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}/resources/${resourceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });
}

export async function deleteNodes(
  { protocolId, nodesIds }: { protocolId: string, nodesIds: string[] }
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
  { protocolId, protocol }: { protocolId: string; protocol: ProtocolUpsert }
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
  { protocolId, edgesIds }: { protocolId: string; edgesIds: string[] }
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
  { protocolId, nodeId, resourceId }: { protocolId: number; nodeId: string; resourceId: string }
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

export function useDeleteResourceNode(): UseMutate<void> {
  return useMutate(deleteNodeResource);
}

export function useUploadNodeResources(): UseMutate<UserFile[]> {
  return useMutate(uploadNodeResources);
}

export function useChangeResourceName(): UseMutate<void> {
  return useMutate(changeResourceName);
}

export function useDeleteDoc(): UseMutate<void> {
  return useMutate(deleteDoc);
}

export function useUploadDocs(): UseMutate<UserFile[]> {
  return useMutate(uploadDocs);
}

export function useChangeDocName(): UseMutate<void> {
  return useMutate(changeDocName);
}

export function useCreateProtocol(): UseMutate<ProtocolSummary> {
  return useMutate(createProtocol);
}

export function useDeleteProtocol(): UseMutate<void> {
  return useMutate(deleteProtocol);
}

export function useUpdateProtocol(): UseMutate<void> {
  return useMutate(updateProtocol);
}