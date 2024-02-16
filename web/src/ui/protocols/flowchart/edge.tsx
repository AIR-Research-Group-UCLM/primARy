import TextField from "@mui/material/TextField";
import {
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  Edge
} from "reactflow";
import useStore from "@/hooks/store";

import type { EdgeProps } from "reactflow";
import { useState } from "react";

export type FlowchartEdgeData = {
  label: string;
  doubleClickSelected: boolean;
}

export const defaultEdgeData = {
  label: "",
  doubleClickSelected: false
}

export type FlowchartEdge = Edge<FlowchartEdgeData>;

const selectedColor = "#037bfc";
const doubleClickColor = "#451fc2";

function selectColor(selected: boolean, selectedModification: boolean) {
  if (selectedModification) {
    return doubleClickColor;
  }

  if (selected) {
    return selectedColor;
  }

  return "black";
}

type EdgeTextFieldProps = {
  edgeId: string;
  label: string;
  labelX: number;
  labelY: number;
  isError: boolean;
  onFocusChange: () => void;
}

function EdgeTextField({ edgeId, label, labelX, labelY, isError, onFocusChange }: EdgeTextFieldProps) {
  const changeEdgeData = useStore((state) => state.changeEdgeData);

  return (
    <TextField
      error={isError}
      inputProps={{
        style: {
          padding: "2.5px 5px",
          textAlign: "center",
        },
      }}
      value={label}
      onChange={(e) => changeEdgeData(edgeId, { label: e.target.value })}
      onFocus={onFocusChange}
      onBlur={onFocusChange}
      variant="outlined"
      size="small"
      className="nopan"
      sx={{
        position: "absolute",
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        pointerEvents: "all",
        textAlign: "center",
        background: "#ffffff",
        width: "75px",
        borderColor: "green"
      }} />
  );
}

export default function RFFlowChartEdge({ id, data, markerEnd, source, selected, ...props }: EdgeProps<FlowchartEdgeData>) {
  // TODO: If visual logic were not coupled to domain logic, we could save some rerenders
  const edges = useStore((state) => state.edges);
  const [focused, setFocused] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath(props);

  const sourceCount = edges.filter((edge) => edge.source === source).length;

  const doubleClickSelected = !!data?.doubleClickSelected;
  const label = data?.label ?? "";
  const shouldTextFieldRender = sourceCount >= 2 || (label !== "") || focused || doubleClickSelected;

  return (
    <>
      <BaseEdge id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selectColor(!!selected, doubleClickSelected),
          strokeWidth: "3px"
        }} />
      {/* For some reason, rendering the TextField makes the editor laggy*/}
      <EdgeLabelRenderer>
        {shouldTextFieldRender &&
          <EdgeTextField
            edgeId={id}
            label={data?.label ?? ""}
            labelX={labelX}
            labelY={labelY}
            isError={label === ""}
            onFocusChange={() => setFocused(!focused)}
          />
        }
      </EdgeLabelRenderer>
    </>
  );
}