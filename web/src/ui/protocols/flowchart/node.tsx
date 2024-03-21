import { Typography } from "@mui/material";

import { Position } from "reactflow";

import type {
  Node,
  NodeProps
} from "reactflow";

import FlowchartHandle from "@/ui/protocols/flowchart/handle";
import useProtocolStore from "@/hooks/store";

export type RFNodeData = {
  isSelectedModification: boolean;
}

const nodeSelectionColor = "#037bfc";
const selectedModificationColor = "#451fc2";
const handleColor = {
  selected: "#043f80",
  selectedModification: "#3d05f7"
}

const positions = [
  Position.Top, Position.Bottom, Position.Left, Position.Right
];

export type FlowchartNode = Node<RFNodeData>;

function selectBorderColor(selected: boolean, selectedModification: boolean) {
  if (selectedModification) {
    return selectedModificationColor;
  }

  if (selected) {
    return nodeSelectionColor;
  }

  return "black";
}

function selectBackgroundColor(isInitial: boolean, isComplete: boolean) {
  if (isInitial) {
    return "#b6ccfe";
  }
  if (!isComplete) {
    return "#ffc2c2";
  }

  return "#f8f9fa";
}

export default function RFFlowchartNode({ id, data, selected }: NodeProps<RFNodeData>) {
  const isInitial = useProtocolStore((state) => state.initialNodeId === id);
  const name = useProtocolStore((state) => state.nodesData.get(id)?.name);

  if (name === undefined) {
    return null
  }

  const isComplete = name !== "";

  return (
    <>
      {
        positions.map((position) =>
          <FlowchartHandle
            key={position.toString()}
            position={position}
            id={position.toString()}
            colors={handleColor}
            isSelected={selected}
            isSelectedModification={data.isSelectedModification}
          />
        )
      }
      <div style={{
        padding: "10px 20px",
        background: "#ffffff",
        border: `solid 2.5px ${selectBorderColor(selected, data.isSelectedModification)}`,
        borderRadius: 10,
        backgroundColor: selectBackgroundColor(isInitial, isComplete),
        display: "flex"
      }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: !isComplete ? "#e31227" : "black"
          }}
        >
          {name || "Unnamed Node"}
        </Typography>
      </div>
    </>
  );
}