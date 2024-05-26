import useSWR from "swr";

import type { UserFile } from "@/types";
import { defaultFetcher } from "@/utils";

export default function useNodeResources(protocolId: string, nodeId: string) {
  const { data: nodeResources, isLoading, mutate, isValidating, error } = useSWR<UserFile[]>(
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