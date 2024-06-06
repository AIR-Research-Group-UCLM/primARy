"use client";

import { ReactFlowProvider, getConnectedEdges } from "reactflow";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import useProtocolStore, { type ProtocolState } from "@/hooks/store";
import FlowChartEditor from "@/ui/protocols/flowchart/editor";
import NodeEditor from "@/ui/protocols/node-editor";

import { noInitialSpace } from "@/utils";

import { FlowchartNode } from "./flowchart/node";
import useSaveEvents, { ReturnEventStore } from "@/hooks/useSaveEvents"
import { SaveEventsContext } from "@/hooks/useSaveEventsContext"

import type { Position, Node } from "@/types";
import type { ValidatorResult, RepeatedOptionResult, BlankOptionResult } from "@/protocol-validator";

import { useRouter } from "next/navigation";
import { upsertProtocol } from "@/mutation";
import { FlowchartEdge } from "./flowchart/edge";
import useLocalEdgesNodes from "@/hooks/useLocalEdgesNodes";
import { flowchartEdgeToEdge } from "@/type-conversions";
import { useEffect, useState } from "react";
import { applyAllValidators } from "@/protocol-validator";
import useToastMessageContext from "@/hooks/useToastMessageContext";
import { Alert } from "@mui/material";

type Props = {
  protocolId: string;
}

function getValidationResultsFromState(state: ProtocolState) {
  const edges = state.edges.map(flowchartEdgeToEdge);
  const nodesData = state.nodesData;
  return applyAllValidators(nodesData, edges);
}

function getEdgeIdsWithRepeatedOptions(validatorResults: ValidatorResult[]): string[] {
  const repeatedOptionResult = validatorResults
    .find((validatorResult) => validatorResult.type === "RepeatedOption") as RepeatedOptionResult | undefined;

  if (repeatedOptionResult === undefined) {
    return [];
  }

  const result = repeatedOptionResult.infos
    .map(
      (info) => info.repeatedOptions.map((repeatedOption) => repeatedOption.edgeIds)
    ).flat(2);

  return result;
}

function getEdgeIdsWithBlankOptions(validatorResults: ValidatorResult[]): string[] {
  const blankOptionResult = validatorResults
    .find((validatorResult) => validatorResult.type === "BlankOption") as BlankOptionResult | undefined;

  if (blankOptionResult === undefined) {
    return [];
  }

  const result = blankOptionResult.infos
    .map(({ blankOptions }) => blankOptions.map((edge) => edge.id))
    .flat(2);

  return result;
}

export default function ProtocolView({ protocolId }: Props) {
  const selectedNodeId = useProtocolStore((state) => state.selectedNodeId);
  const name = useProtocolStore((state) => state.name);
  const changeName = useProtocolStore((state) => state.changeName);

  const { localNodes, localEdges } = useLocalEdgesNodes();

  const [validatorResults, setValidatorResults] = useState<ValidatorResult[]>([]);
  const saveEvents = useSaveEvents(onSave, 2000, 10000);
  const setToastMessage = useToastMessageContext();
  const { recordEvent, flush, isPending } = saveEvents;

  const router = useRouter();

  useEffect(() => () => {
    flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function onSave(events: ReturnEventStore) {
    const currentState = useProtocolStore.getState();
    const nodeMap = new Map<string, FlowchartNode>(currentState.nodes.map((node) => [node.id, node]));
    const edgeMap = new Map<string, FlowchartEdge>(currentState.edges.map((edge) => [edge.id, edge]));

    const name = events.nameChanged && currentState.name !== "" ? currentState.name : undefined;

    const validatorResults = getValidationResultsFromState(currentState);
    setValidatorResults(validatorResults);

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

    const repeatedEdgeIds = getEdgeIdsWithRepeatedOptions(validatorResults);
    const blankEdgeIds = getEdgeIdsWithBlankOptions(validatorResults);

    for (const edgeId of edgesIds) {
      const edge = edgeMap.get(edgeId);

      if (edge == null || localNodes.isLocalId(edge.target) ||
        localNodes.isLocalId(edge.source) || repeatedEdgeIds.includes(edgeId) || blankEdgeIds.includes(edgeId)
      ) {
        continue;
      }

      localEdges.removeLocalId(edge.id);
      edges.push(flowchartEdgeToEdge(edge));
    }


    if (!name && nodes.length === 0 && edges.length == 0) {
      return;
    }

    try {
      await upsertProtocol({
        protocolId, protocol: {
          name, nodes, edges
        }
      });
      setValidatorResults(validatorResults);
    } catch (error) {
      setToastMessage({
        type: "error",
        text: String(error)
      })
      throw error;
    }
  }

  function onNameChange(newName: string) {
    changeName(noInitialSpace(newName));
    recordEvent({
      type: "name"
    });
  }

  function getAlertData(): {
    severity: "info" | "warning" | "success";
    message: string;
  } {
    if (isPending) {
      return {
        severity: "info",
        message: "Saving changes..."
      }
    }

    if (validatorResults.length > 0 || name === "") {
      return {
        severity: "warning",
        message: "Partially saved"
      }
    }

    return {
      severity: "success",
      message: "Correctly saved"
    }
  }

  function getAlertElement() {
    const { severity, message } = getAlertData();
    return (
      <Alert
        severity={severity}
        variant="filled"
        style={{
          fontSize: "20px",
        }}
      >
        {message}
      </Alert>
    )
  }

  async function onSaveClick() {
    flush();
  }

  return (
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
            flex: "2",
            border: "solid 1px"
          }}>
            <ReactFlowProvider>
              <FlowChartEditor
                protocolId={protocolId}
                onDeleteElement={() => {
                  setValidatorResults(getValidationResultsFromState(useProtocolStore.getState()))
                }
                }
              />
            </ReactFlowProvider>
          </Paper>

          {selectedNodeId &&
            <NodeEditor
              protocolId={protocolId}
              selectedNodeId={selectedNodeId}
            />
          }
        </Box>
        <Box
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            marginTop: "15px"
          }}
        >
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
          <Box sx={{
            width: "250px"
          }}>
            {getAlertElement()}
          </Box>
        </Box>
      </Box>
    </ SaveEventsContext.Provider>
  )
}