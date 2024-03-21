import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import useProtocolStore from "@/hooks/store";
import NodeResourcesDialog from "@/ui/dialogs/node-resources";

import "@/ui/protocols/textfield.css";
import { Button } from "@mui/material";

import { noInitialSpace } from "@/utils";
import { useState } from "react";
import useSaveEventsContext from "@/hooks/useSaveEventsContext";
import useLocalEdgesNodes from "@/hooks/useLocalEdgesNodes";

type Props = {
  protocolId: number;
  selectedNodeId: string
}

export default function NodeInfoEditor({ protocolId, selectedNodeId }: Props) {
  const changeNodeData = useProtocolStore((state) => state.changeNodeData);
  const data = useProtocolStore((state) => state.nodesData.get(selectedNodeId));
  const { recordEvent, flush, cancelEvent } = useSaveEventsContext();
  const { localNodes } = useLocalEdgesNodes();

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  if (data === undefined) {
    return null;
  }

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
    setDialogOpen(false);
  }

  async function onResourcesClick() {
    if (localNodes.isLocalId(selectedNodeId)) {
      // Create it if it is not already
      await flush();
    }

    setDialogOpen(true);
  }

  function onNameChange(name: string) {
    changeNodeData(selectedNodeId, { name: noInitialSpace(name) });
    recordEvent({
      type: "node",
      id: selectedNodeId
    })
  }

  function onDescriptionChange(description: string) {
    changeNodeData(selectedNodeId, { description: noInitialSpace(description) });
    recordEvent({
      type: "node",
      id: selectedNodeId
    })
  }

  return (
    <>
      <Paper
        elevation={5}
        sx={{
          flex: "1 0",
          border: "solid 1px",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextField
          fullWidth
          required
          error={data.name === ""}
          label="Name"
          value={data.name}
          onChange={(e) => onNameChange(e.target.value)}
          variant="outlined"
          sx={{
            marginBottom: "10px"
          }}
        />
        <TextField
          fullWidth
          multiline
          onChange={(e) => onDescriptionChange(e.target.value)}
          value={data.description ?? ""}
          id="description"
          label="Description"
          variant="outlined"
          maxRows={10}
          InputProps={{
            sx: {
              height: "100%",
              alignItems: "normal",
            }
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px"
          }}
        >
          <Button
            disabled={data.name === ""}
            variant="contained"
            size="medium"
            onClick={onResourcesClick}
            sx={{
              borderRadius: "30px"
            }}
            startIcon={<LibraryBooksIcon />}
          >
            Resources
          </Button>
        </Box>
      </Paper>
      {isDialogOpen && <NodeResourcesDialog
        isOpen={isDialogOpen}
        protocolId={protocolId}
        nodeId={selectedNodeId}
        handleClose={handleClose}
      />}
    </>
  );
}