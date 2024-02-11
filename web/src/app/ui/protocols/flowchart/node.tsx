import FlowChartHandle from "@/app/ui/protocols/flowchart/handle";

import { Position } from "reactflow";

import type {
  NodeProps
} from "reactflow";

export type FlowChartNodeData = {
  label: string;
}

const nodeSelectionColor = "#037bfc";
const handleColor = {
  selected: "#043f80"
}

const positions = [
  Position.Top, Position.Bottom, Position.Left, Position.Right
];


export default function FlowChartNode({ data, selected }: NodeProps<FlowChartNodeData>) {
  return (
    <>
      <div style={{
        padding: "10px 20px",
        background: "#ffffff",
        border: `solid 2.5px ${selected ? nodeSelectionColor : ""}`,
        borderRadius: 10,
      }}>
        {
          positions.map((position) =>
            <FlowChartHandle
              key={position.toString()}
              position={position}
              id={position.toString()}
              colors={handleColor}
              isSelected={selected}
            />
          )
        }
        {data.label}
      </div>
    </>
  );
}