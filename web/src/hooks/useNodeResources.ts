import useSWR from "swr";

import type { NodeResource } from "@/types";
import { defaultFetcher } from "@/utils";

export default function useNodeResources(protocolId: number, nodeId: string) {
  const { data: nodeResources, isLoading, mutate, isValidating, error } = useSWR<NodeResource[]>(
    `${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}/resources`, defaultFetcher, {
    revalidateOnFocus: false,
  }
  );

  return {
    nodeResources: nodeResources ?? [],
    isLoading,
    mutate,
    isValidating,
    error
  }
}