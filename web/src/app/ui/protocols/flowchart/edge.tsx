import TextField from "@mui/material/TextField";
import {
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
} from "reactflow";
import useStore from "@/app/protocols/store";

import type { EdgeProps } from "reactflow";

export type FlowChartEdgeData = {
  label?: string;
}

export default function FlowChartEdge({ id, data, markerEnd, ...props }: EdgeProps<FlowChartEdgeData>) {
  const changeEdgeLabel = useStore((state) => state.changeEdgeLabel);
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
          value={data?.label ?? ""}
          onChange={(e) => changeEdgeLabel(id, e.target.value)}
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