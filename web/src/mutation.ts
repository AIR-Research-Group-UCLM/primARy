import type { ProtocolSummary } from "@/types";
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

async function updateProtocol(
  { protocolId, protocolData }: { protocolId: number, protocolData: ProtocolData }
) {
  return JSONfetcher(`${process.env.API_BASE}/protocols/${protocolId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(protocolDataToProtocol(protocolId, protocolData))
  });
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