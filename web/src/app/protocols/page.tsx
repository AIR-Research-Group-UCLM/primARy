"use client";

import { ReactFlowProvider } from "reactflow";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import FlowChartEditor from "@/app/ui/protocols/flowchart/editor";

export default function Page() {
  return (
    <Box sx={{
      height: "100%",
      display: "flex",
      gap: "10px",
      padding: "5px"
    }}>
      <Paper elevation={5} sx={{
        flexGrow: 2.5,
        border: "solid"
      }}>
        <ReactFlowProvider>
          <FlowChartEditor />
        </ReactFlowProvider>
      </Paper>

      <Paper
        elevation={5}
        sx={{
          flexGrow: 1,
          border: "solid",
        }}
        >
      </Paper>

    </Box>
  )
}