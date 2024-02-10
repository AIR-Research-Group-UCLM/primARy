"use client";

import { ReactFlowProvider } from "reactflow";
import FlowChartEditor from "@/app/ui/protocols/flowchart/editor";

export default function Page() {
  return (
    <div style={{ height: "100%", border: "solid" }}>
      <ReactFlowProvider>
        <FlowChartEditor />
      </ReactFlowProvider>
    </div>
  );
}