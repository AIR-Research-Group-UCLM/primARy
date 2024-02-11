import FlowchartHandle from "@/app/ui/protocols/flowchart/handle";

import { Position } from "reactflow";

import type {
  Node,
  NodeProps
} from "reactflow";

export type FlowchartNodeData = {
  label: string;
}

const nodeSelectionColor = "#037bfc";
const handleColor = {
  selected: "#043f80"
}

const positions = [
  Position.Top, Position.Bottom, Position.Left, Position.Right
];

export type FlowchartNode = Node<FlowchartNodeData>;


export default function RFFlowchartNode({ data, selected }: NodeProps<FlowchartNodeData>) {
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
            <FlowchartHandle
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