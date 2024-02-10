import FlowChartHandle from "@/app/ui/protocols/flowchart/handle";

import { Position } from "reactflow";

import type {
    NodeProps
} from "reactflow";

export type FlowChartNodeData = {
  label: string;
}

export default function FlowChartNode({ data }: NodeProps<FlowChartNodeData>) {
  return (
    <>
      <FlowChartHandle position={Position.Top} id="top" />
      <FlowChartHandle position={Position.Left} id="left" />
      <FlowChartHandle position={Position.Bottom} id="bottom" />
      <FlowChartHandle position={Position.Right} id="right" />

      <div style={{
        padding: "10px 20px",
        background: "#ffffff",
        border: "solid 2px",
        borderRadius: 10,
      }}>
        {data.label}
      </div>
    </>
  );
}