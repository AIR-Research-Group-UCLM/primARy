"use client";

import { ReactFlowProvider } from "reactflow";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

import useStore from "@/app/protocols/store";
import FlowChartEditor from "@/app/ui/protocols/flowchart/editor";
import NodeInfoEditor from "@/app/ui/protocols/node-info-editor";

export default function Page() {
  const selectedNode = useStore((state) => state.selectedNode);

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      padding: "5px",
      height: "100%"
    }}>
      <TextField
        fullWidth
        label="Protocol Name"
        variant="outlined"
        sx={{
          marginBottom: "10px",
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
      <Box sx={{
        display: "flex",
        gap: "10px",
        height: "100%"
      }}>
        <Paper elevation={10} sx={{
          flex: "2 0",
          border: "solid 2px"
        }}>
          <ReactFlowProvider>
            <FlowChartEditor />
          </ReactFlowProvider>
        </Paper>

        {<Paper
          elevation={5}
          sx={{
            flex: "1 0",
            border: "solid 2px",
            padding: "15px",
            display: selectedNode === null ? "none" : "flex",
            flexDirection: "column"
          }}
        >
          {selectedNode && <NodeInfoEditor selectedNode={selectedNode} />}
        </Paper>}
      </Box>
    </Box>
  )
}