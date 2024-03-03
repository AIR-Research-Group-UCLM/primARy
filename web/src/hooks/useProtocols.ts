import { defaultFetcher } from "@/utils";
import useSWR from "swr";

import type { ProtocolSummary } from "@/types";

export default function useProtocols() {
    const { data: protocols, mutate, error, isLoading} = useSWR<ProtocolSummary[]>(
        `${process.env.API_BASE}/protocols`, defaultFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    return {
        protocols,
        isLoading,
        mutate,
        error
    }
}