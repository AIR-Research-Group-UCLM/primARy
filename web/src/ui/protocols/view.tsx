"use client";

import { ReactFlowProvider } from "reactflow";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import useProtocolStore from "@/hooks/store";
import FlowChartEditor from "@/ui/protocols/flowchart/editor";
import NodeEditor from "@/ui/protocols/node-editor";

export default function ProtocolView() {
  const selectedNodeId = useProtocolStore((state) => state.selectedNodeId);
  const name = useProtocolStore((state) => state.name);
  const changeName = useProtocolStore((state) => state.changeName);

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      padding: "5px",
      height: "100%"
    }}>
      <Box sx={{
        display: "flex",
        background: "white",
      }}>
        <TextField
          fullWidth
          label="Protocol Name"
          value={name}
          onChange={(e) => changeName(e.target.value)}
          variant="outlined"
          sx={{
            marginBottom: "10px",
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
            <FlowChartEditor />
          </ReactFlowProvider>
        </Paper>

        {<Paper
          elevation={5}
          sx={{
            flex: "1 0",
            border: "solid 1px",
            padding: "15px",
            display: selectedNodeId === null ? "none" : "flex",
            flexDirection: "column"
          }}
        >
          {selectedNodeId && <NodeEditor selectedNodeId={selectedNodeId} />}
        </Paper>}
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
        <Box sx={{
          display: "flex",
          flex: "1 0",
          justifyContent: "center",
        }} >
          <Button
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
          flex: "1 0",
          justifyContent: "center",
        }} >
          <Button
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
  )
}