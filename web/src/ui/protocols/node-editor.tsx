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

type Props = {
  protocolId: number;
  selectedNodeId: string
}

export default function NodeInfoEditor({ protocolId, selectedNodeId }: Props) {
  const changeNodeData = useProtocolStore((state) => state.changeNodeData);
  const data = useProtocolStore((state) => state.nodesData.get(selectedNodeId)!);
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      return;
    }
    setDialogOpen(false);
  }

  function onNameChange(name: string) {
    changeNodeData(selectedNodeId, {name: noInitialSpace(name)})
  }

  function onDescriptionChange(description: string) {
    changeNodeData(selectedNodeId, { description: noInitialSpace(description) });
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
            variant="contained"
            size="medium"
            onClick={() => setDialogOpen(true)}
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