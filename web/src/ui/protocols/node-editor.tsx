import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import useProtocolStore from "@/hooks/store";
import NodeResourcesDialog from "@/ui/dialogs/node-resources";

import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Chip from '@mui/material/Chip';

import type { Edge } from "@/types";

import { noInitialSpace } from "@/utils";
import { useState } from "react";
import useSaveEventsContext from "@/hooks/useSaveEventsContext";
import useLocalEdgesNodes from "@/hooks/useLocalEdgesNodes";
import { flowchartEdgeToEdge } from "@/type-conversions";

type Props = {
  protocolId: string;
  selectedNodeId: string
}

export default function NodeInfoEditor({ protocolId, selectedNodeId }: Props) {
  const changeNodeData = useProtocolStore((state) => state.changeNodeData);
  const data = useProtocolStore((state) => state.nodesData.get(selectedNodeId));
  const requiredEdges = useProtocolStore(
    (state) => state.edges
      .map(flowchartEdgeToEdge)
      .filter((edge) => state.nodesData.get(selectedNodeId)!.requiredEdgesIds.includes(edge.id))
  );
  const requiredEdgeSelectionEnabled = useProtocolStore((state) => state.requiredEdgeSelectionEnabled);
  const removeRequiredEdgeId = useProtocolStore((state) => state.removeRequiredEdgeId);

  const { recordEvent, flush } = useSaveEventsContext();
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

  function onRequiredEdgeClick() {
    useProtocolStore.setState((state) => ({
      requiredEdgeSelectionEnabled: !state.requiredEdgeSelectionEnabled
    }));
  }

  async function onResourcesClick() {
    if (localNodes.isLocalId(selectedNodeId)) {
      // Create it if it is not already
      await flush();
    }

    setDialogOpen(true);
  }

  function onRequiredEdgeDelete(edge: Edge) {
    removeRequiredEdgeId(selectedNodeId, edge.id);
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
          flex: "1",
          border: "solid 1px",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Box sx={{
          maxHeight: "250px"
        }}>
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
              gap: "20px",
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
            <Button
              disabled={data.name === ""}
              variant="contained"
              size="medium"
              onClick={onRequiredEdgeClick}
              sx={{
                borderRadius: "30px"
              }}
            >
              {requiredEdgeSelectionEnabled ? "Cancel selection" : "Add required edge"}
            </Button>
          </Box>
          <Divider sx={{
            margin: "10px 0"
          }} />
          <Box>
            {requiredEdges.map((requiredEdge) => (
              <Chip
                label={requiredEdge.label}
                key={requiredEdge.id}
                onDelete={() => onRequiredEdgeDelete(requiredEdge)}
              />
            ))}
          </Box>
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