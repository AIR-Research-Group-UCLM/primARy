import useSWR from "swr";

import type { UserFile } from "@/types";
import { defaultFetcher } from "@/utils";

export default function useDocs(protocolId: string) {
  const { data: docs, isLoading, mutate, isValidating, error } = useSWR<UserFile[]>(
    `${process.env.API_BASE}/protocols/${protocolId}/docs`, defaultFetcher, {
    revalidateOnFocus: false,
  }
  );

  return {
    docs: docs ?? [],
    isLoading,
    mutate,
    isValidating,
    error
  }
}