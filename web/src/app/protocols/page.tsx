"use client";

import { ReactFlowProvider } from "reactflow";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import useStore from "@/app/protocols/store";
import FlowChartEditor from "@/app/ui/protocols/flowchart/editor";
import NodeInfoEditor from "@/app/ui/protocols/node-info-editor";

export default function Page() {
  const selectedNode = useStore((state) => state.selectedNode);

  return (
    <Box sx={{
      height: "100%",
      display: "flex",
      gap: "10px",
      padding: "5px",
    }}>
      <Paper elevation={5} sx={{
        flex: "1 0 66%",
        border: "solid"
      }}>
        <ReactFlowProvider>
          <FlowChartEditor />
        </ReactFlowProvider>
      </Paper>

      {selectedNode && <Paper
        sx={{
          flex: "1 0 34%",
          border: "solid",
          padding: "15px",
          display: "flex",
          flexDirection: "column"
        }}
        >
          <NodeInfoEditor selectedNode={selectedNode} />
        </Paper>}

    </Box>
  )
}