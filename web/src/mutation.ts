import type { ProtocolSummary } from "@/types";
import type { ProtocolData } from "@/hooks/store";

import {protocolDataToProtocol} from "@/type-conversions";


export async function createProtocol(name: string): Promise<ProtocolSummary> {
  const res = await fetch(`${process.env.API_BASE}/protocols`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function deleteProtocol(protocolId: number) {
  return fetch(`${process.env.API_BASE}/protocols/${protocolId}`, {
    method: "DELETE"
  });
}

export async function updateProtocol(protocolId: number, protocolData: ProtocolData) {
  return fetch(`${process.env.API_BASE}/protocols/${protocolId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(protocolDataToProtocol(protocolId, protocolData))
  });
}