"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import AddIcon from '@mui/icons-material/Add';

import ProtocolCard from "@/ui/protocols/protocol-card";
import CreateProtocolDialog from "@/ui/dialogs/create-protocol";

import { ProtocolSummary } from "@/types";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/ui/dialogs/confirm";
import LoadingSpinner from "@/ui/loading-spinner";
import useProtocols from "@/hooks/useProtocols";

import { useCreateProtocol, useDeleteProtocol } from "@/mutation";

export default function Page() {
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [protocolForDelete, setProtocolForDelete] = useState<ProtocolSummary | null>(null);
  const { triggerCreateProtocol, isCreatingProtocol } = useCreateProtocol();
  const { triggerDeleteProtocol, isDeletingProtocol } = useDeleteProtocol();
  const { protocols, isLoading, mutate } = useProtocols();
  const router = useRouter();

  const showLinearProgress = isDeletingProtocol || isCreatingProtocol;


  async function onCreateClick(name: string) {
    const protocol = await triggerCreateProtocol({ name });
    router.push(`/protocols/${protocol.id}`);
  }

  async function onDeleteProtocol(protocolId: number) {
    setProtocolForDelete(null);
    await triggerDeleteProtocol({ protocolId });
    const remainingProtocols = protocols.filter((protocol) => protocol.id !== protocolId);
    mutate(remainingProtocols, {
      revalidate: false,
    });
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
          overflow: "auto"
        }}>
          {protocols.map((protocol) =>
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              onDeleteClick={(protocol) => setProtocolForDelete(protocol)}
            />
          )}
        </Paper>
        <Box sx={{
          width: "100%"
        }}>
          {showLinearProgress && <LinearProgress />}
        </Box>
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
        onCreateClick={async (name) => {
          setDialogOpen(false);
          await onCreateClick(name);
        }}
      />}
      {protocolForDelete !== null && <ConfirmDialog
        isOpen={protocolForDelete !== null}
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