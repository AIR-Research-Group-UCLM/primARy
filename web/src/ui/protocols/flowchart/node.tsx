import { Typography } from "@mui/material";

import { Position } from "reactflow";

import type {
  Node,
  NodeProps
} from "reactflow";

import FlowchartHandle from "@/ui/protocols/flowchart/handle";
import useStore from "@/hooks/store";

// TODO: research whether there exists a convention where these types are located
export type RFNodeData = {
  isSelectedModification: boolean;
}

export type FlowchartNodeData = {
  name: string;
  description: string | null;
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

function selectColor(selected: boolean, selectedModification: boolean) {
  if (selectedModification) {
    return selectedModificationColor;
  }

  if (selected) {
    return nodeSelectionColor;
  }

  return "black";
}


export default function RFFlowchartNode({ id, data, selected }: NodeProps<RFNodeData>) {
  const name = useStore((state) => state.nodesData.get(id)!.name);

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
        border: `solid 2.5px ${selectColor(selected, data.isSelectedModification)}`,
        borderRadius: 10,
        display: "flex"
      }}>
        <Typography variant="h6" component="div">{name}</Typography>
      </div>
    </>
  );
}