"use client";

import { ReactFlowProvider, getConnectedEdges } from "reactflow";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import useProtocolStore from "@/hooks/store";
import useToastMessage from "@/hooks/useToastMessage";
import FlowChartEditor from "@/ui/protocols/flowchart/editor";
import NodeEditor from "@/ui/protocols/node-editor";

import { UnsuccessfulResponse, noInitialSpace } from "@/utils";

import { FlowchartNode } from "./flowchart/node";
import useSaveEvents, { ReturnEventStore } from "@/hooks/useSaveEvents"
import { SaveEventsContext } from "@/hooks/useSaveEventsContext"

import type { Position, Node } from "@/types";

import { useRouter } from "next/navigation";
import { upsertProtocol } from "@/mutation";
import { FlowchartEdge } from "./flowchart/edge";
import useLocalEdgesNodes from "@/hooks/useLocalEdgesNodes";
import { flowchartEdgeToEdge } from "@/type-conversions";
import { useEffect } from "react";

type Props = {
  protocolId: number;
}

export default function ProtocolView({ protocolId }: Props) {
  const selectedNodeId = useProtocolStore((state) => state.selectedNodeId);
  const name = useProtocolStore((state) => state.name);
  const changeName = useProtocolStore((state) => state.changeName);

  const { localNodes, localEdges } = useLocalEdgesNodes();

  const saveEvents = useSaveEvents(onSave, 2000, 10000);
  const { recordEvent, flush, isPending } = saveEvents;

  const { isOpen, toastMessage, messageType, setToastMessage } = useToastMessage();
  const router = useRouter();

  useEffect(() => () => {
    flush();
  }, []);

  async function onSave(events: ReturnEventStore) {
    const currentState = useProtocolStore.getState();
    const nodeMap = new Map<string, FlowchartNode>(currentState.nodes.map((node) => [node.id, node]));
    const edgeMap = new Map<string, FlowchartEdge>(currentState.edges.map((edge) => [edge.id, edge]));

    const name = events.nameChanged && currentState.name !== "" ? currentState.name : undefined;

    const nodes: Node[] = [];
    const extraEdgeIds: string[] = [];
    for (const nodeId of events.nodeIds) {
      const node = nodeMap.get(nodeId);
      const data = currentState.nodesData.get(nodeId);

      if (node == null || data == null || data.name === "") {
        continue;
      }

      if (localNodes.isLocalId(nodeId)) {
        const edges = getConnectedEdges([node], currentState.edges);
        // TODO: consider making a Set or directly passing the set from "events" if this severly affects
        // performance. 
        for (const edge of edges) {
          if (!events.edgeIds.some((edgeId) => edge.id === edgeId)) {
            extraEdgeIds.push(edge.id)
          }
        }
        localNodes.removeLocalId(nodeId);
      }

      nodes.push({
        id: node.id,
        position: node.position as Position,
        data
      })
    }

    const edges = []
    const edgesIds = [...events.edgeIds, ...extraEdgeIds];
    for (const edgeId of edgesIds) {
      const edge = edgeMap.get(edgeId);
      if (edge == null) {
        continue;
      }

      if (localNodes.isLocalId(edge.target) || localNodes.isLocalId(edge.source)) {
        continue;
      }
      
      localEdges.removeLocalId(edge.id);
      edges.push(flowchartEdgeToEdge(edge));
    }

    if (name || nodes.length > 0 || edges.length > 0) {
      await upsertProtocol({
        protocolId, protocol: {
          name, nodes, edges
        }
      });
      setToastMessage({
        type: "success",
        message: "Guardado"
      });
    }
  }

  function onNameChange(newName: string) {
    changeName(noInitialSpace(newName));
    recordEvent({
      type: "name"
    });
  }

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    setToastMessage(null);
  }

  async function onSaveClick() {
    flush();
  }

  return (
    <>
      <SaveEventsContext.Provider value={saveEvents}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          padding: "5px",
          height: "100%"
        }}>
          <Box>
            <TextField
              fullWidth
              error={name === ""}
              required
              label="Protocol Name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              variant="outlined"
              sx={{
                marginBottom: "10px",
                background: "white",
                flexGrow: 1
              }}
              inputProps={{
                style: {
                  fontSize: "20px"
                }
              }}
              InputProps={{
                style: {
                  fontSize: "15px"
                }
              }}
            />
          </Box>
          <Box sx={{
            display: "flex",
            gap: "10px",
            height: "100%"
          }}>
            <Paper elevation={5} sx={{
              flex: "2 0",
              border: "solid 1px"
            }}>
              <ReactFlowProvider>
                <FlowChartEditor protocolId={protocolId} />
              </ReactFlowProvider>
            </Paper>

            {selectedNodeId &&
              <NodeEditor
                protocolId={protocolId}
                selectedNodeId={selectedNodeId}
              />
            }
          </Box>
          <Paper
            elevation={5}
            sx={{
              display: "flex",
              border: "solid 1px",
              alignContent: "center",
              justifyContent: "center",
              padding: "10px",
              marginTop: "20px"
            }}
          >
            {false && <LinearProgress />}
            <Box sx={{
              display: "flex",
              flex: "1",
              justifyContent: "center",
            }} >
              <Button
                onClick={async () => {
                  await flush();
                  router.push("/protocols");
                }}
                variant="contained"
                size="large"
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: "30px"
                }}
              >
                Exit and save
              </Button>
            </Box>
            <Box sx={{
              display: "flex",
              flex: "1",
              justifyContent: "center",
            }} >
              <Button
                disabled={!isPending}
                onClick={onSaveClick}
                variant="contained"
                size="large"
                startIcon={<SaveAltIcon />}
                sx={{
                  borderRadius: "30px"
                }}
              >
                Save
              </Button>
            </Box>
          </Paper>
        </Box>
      </ SaveEventsContext.Provider>
      <Snackbar
        open={isOpen}
        autoHideDuration={messageType == "success" ? 1500 : 3000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={messageType}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  )
}