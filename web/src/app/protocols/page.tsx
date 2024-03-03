"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';

import ProtocolCard from "@/ui/protocols/protocol-card";
import CreateProtocolDialog from "@/ui/dialogs/create-protocol";

import useSWR from "swr";
import { defaultFetcher } from "@/utils";
import { ProtocolSummary } from "@/types";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function createProtocol(name: string): Promise<ProtocolSummary> {
  const res = await fetch(`${process.env.API_BASE}/protocols`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  })
  return res.json();
}

export default function Page() {
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  const { data: protocols, mutate, error, isLoading } = useSWR<ProtocolSummary[]>(
    `${process.env.API_BASE}/protocols`, defaultFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  }
  );

  async function onCreateClick(name: string) {
    const protocol = await createProtocol(name);
    // TODO: check for any possible errors
    router.push(`/protocols/${protocol.id}`);
  }

  if (isLoading) {
    return <h1>Loading...</h1>
  }


  return (
    <>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "inherit",
        height: "91%",
        gap: "10px"
      }}>
        <Paper elevation={5} sx={{
          border: "solid 1px",
          borderRadius: "10px",
          display: "grid",
          // gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "200px",
          gridGap: "30px 20px",
          backgroundColor: "inherit",
          flex: "12",
          padding: "10px",
          overflow: "scroll"
        }}>
          {protocols?.map((protocol) =>
            <ProtocolCard key={protocol.id} protocol={protocol} />
          )}
        </Paper>
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          flex: "1",
          paddingBottom: "10px"
        }}>
          <Button
            variant="contained"
            size="medium"
            onClick={() => setDialogOpen(true)}
            sx={{
              borderRadius: "30px"
            }}
            startIcon={<AddIcon />}
          >
            Create Protocol
          </Button>
        </Box>
      </Box>
      <CreateProtocolDialog
        isOpen={isDialogOpen}
        handleClose={() => setDialogOpen(false)}
        onCreateClick={(name) => onCreateClick(name)}
      />
    </>
  );
}