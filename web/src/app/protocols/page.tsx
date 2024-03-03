"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';

import ProtocolCard from "@/ui/protocols/protocol-card";
import CreateProtocolDialog from "@/ui/dialogs/create-protocol";

import { ProtocolSummary } from "@/types";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/ui/dialogs/confirm";
import LoadingSpinner from "@/ui/loading-spinner";
import useProtocols from "@/hooks/useProtocols";

async function createProtocol(name: string): Promise<ProtocolSummary> {
  const res = await fetch(`${process.env.API_BASE}/protocols`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });
  return res.json();
}

async function deleteProtocol(protocolId: number) {
  const rest = await fetch(`${process.env.API_BASE}/protocols/${protocolId}`, {
    method: "DELETE"
  });
}

export default function Page() {
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [protocolForDelete, setProtocolForDelete] = useState<ProtocolSummary | null>(null);
  const router = useRouter();

  const {protocols, isLoading, mutate} = useProtocols();
  

  async function onCreateClick(name: string) {
    const protocol = await createProtocol(name);
    router.push(`/protocols/${protocol.id}`);
  }

  async function onDeleteProtocol(protocolId: number) {
    await deleteProtocol(protocolId);
    const remainingProtocols = protocols!.filter((protocol) => protocol.id !== protocolId);
    mutate(remainingProtocols, {
      revalidate: false
    });
    setProtocolForDelete(null);
  }

  if (isLoading) {
    return <LoadingSpinner />
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
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              onDeleteClick={(protocol) => setProtocolForDelete(protocol)}
            />
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

      {isDialogOpen && <CreateProtocolDialog
        isOpen={isDialogOpen}
        handleClose={() => setDialogOpen(false)}
        onCreateClick={(name) => onCreateClick(name)}
      />}
      {protocolForDelete !== null && <ConfirmDialog
        isOpen={deleteProtocol !== null}
        title="Confirm delete"
        contentText={
          `Are you sure you want to delete the protocol ${protocolForDelete.name}? This action cannot be undone`
        }
        action="Delete"
        onCancelClick={() => setProtocolForDelete(null)}
        onActionClick={() => onDeleteProtocol(protocolForDelete.id)}
      />
      }
    </>
  );
}