"use client";

export const dynamic = "force-dynamic";

import Box from "@mui/material/Box";

import ProtocolStoreProvider from "@/ui/protocols/store-provider";
import ProtocolView from "@/ui/protocols/view";

import LoadingSpinner from "@/ui/loading-spinner";

import type { Protocol } from "@/types";
import useSWR from "swr";
import { defaultFetcher } from "@/utils";

import { protocolToProtocolData } from "@/type-conversions";

export default function Page({ params }: { params: { id: string } }) {
  const { data, isLoading } = useSWR<Protocol>(
    `${process.env.API_BASE}/protocols/${params.id}`, defaultFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  }
  );

  if (!data || isLoading) {
    return <LoadingSpinner />
  }

  const protocol = protocolToProtocolData(data)

  return (
    <Box sx={{
      height: "91%"
    }}>
      <ProtocolStoreProvider protocol={protocol}>
        <ProtocolView protocolId={data.id}/>
      </ProtocolStoreProvider>
    </Box>
  );
}