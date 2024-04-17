import useSWR from "swr";

import type { UserFile } from "@/types";
import { defaultFetcher } from "@/utils";

export default function useNodeResources(protocolId: number, nodeId: string) {
  const { data: files, isLoading, mutate, isValidating, error } = useSWR<UserFile[]>(
    `${process.env.API_BASE}/protocols/${protocolId}/nodes/${nodeId}/resources`, defaultFetcher, {
    revalidateOnFocus: false,
  }
  );

  return {
    files: files ?? [],
    isLoading,
    mutate,
    isValidating,
    error
  }
}