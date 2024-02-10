import TextField from "@mui/material/TextField";
import {
    getBezierPath,
    BaseEdge,
    EdgeLabelRenderer,
} from "reactflow";
import type { EdgeProps } from "reactflow";

export type FlowChartEdgeData = {
  label?: string;
}

export default function FlowChartEdge({ id, data, markerEnd, ...props }: EdgeProps<FlowChartEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath(props);

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <TextField
          inputProps={{
            style: {
              padding: "2.5px 5px",
              textAlign: "center"
            }
          }}
          defaultValue={data?.label}
          variant="outlined"
          size="small"
          sx={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            textAlign: "center",
            background: "#ffffff",
            width: "75px"
          }} />
      </EdgeLabelRenderer>
    </>
  );
}