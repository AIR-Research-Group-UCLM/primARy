import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import useProtocolStore from "@/hooks/store";
import NodeResourcesDialog from "@/ui/dialogs/node-resources";

import type { Node } from "@/types";
import { createNode } from "@/mutation";

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
  const data = useProtocolStore((state) => state.nodesData.get(selectedNodeId));
  const position = useProtocolStore((state) =>
    state.nodes.find((node) => node.id === selectedNodeId)?.position
  );
  const isLocal = useProtocolStore((state) => state.localNodesIds.has(selectedNodeId));
  const removeLocalNode = useProtocolStore((state) => state.removeLocalNode);
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
    if (data == undefined || position == null) {
      return;
    }

    // TODO: check for errors
    if (isLocal) {
      const node: Node = {
        id: selectedNodeId,
        position,
        data
      }
      await createNode({ protocolId, node })
      removeLocalNode(selectedNodeId);
    }

    setDialogOpen(true);
  }

  function onNameChange(name: string) {
    changeNodeData(selectedNodeId, { name: noInitialSpace(name) })
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