"use client";

import { ReactFlowProvider } from "reactflow";
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

import { useUpdateProtocol } from "@/mutation";

import { useRouter } from "next/navigation";

type Props = {
  protocolId: number;
}

export default function ProtocolView({ protocolId }: Props) {
  const selectedNodeId = useProtocolStore((state) => state.selectedNodeId);
  const name = useProtocolStore((state) => state.name);
  const changeName = useProtocolStore((state) => state.changeName);
  const router = useRouter();
  const { isOpen, toastMessage, messageType, setToastMessage } = useToastMessage();

  const { triggerUpdateProtocol, isUpdatingProtocol } = useUpdateProtocol();

  function onNameChange(newName: string) {
    changeName(noInitialSpace(newName));
  }

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    setToastMessage(null);
  }

  async function updateProtocol() {
    try {
      await triggerUpdateProtocol({ protocolId, protocolData: useProtocolStore.getState() });
      setToastMessage({
        type: "success",
        message: "Protocol updated sucessfully"
      })
      return true;
    }
    catch (error) {
      const errorMsg = error instanceof UnsuccessfulResponse ?
        (
          `Error ${error.status}: ${error.message}`
        ) :
        (
          String(error)
        );

      setToastMessage({
        type: "error",
        message: errorMsg
      })
      return false;
    }
  }

  return (
    <>
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
          {isUpdatingProtocol && <LinearProgress />}
          <Box sx={{
            display: "flex",
            flex: "1",
            justifyContent: "center",
          }} >
            <Button
              onClick={async () => {
                const wasSuccessful = await updateProtocol();
                if (wasSuccessful) {
                  router.push("/protocols");
                }
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
              onClick={updateProtocol}
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