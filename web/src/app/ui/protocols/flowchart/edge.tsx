import TextField from "@mui/material/TextField";
import {
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  Edge
} from "reactflow";
import useStore from "@/app/protocols/store";

import type { EdgeProps } from "reactflow";

export type FlowchartEdgeData = {
  label?: string;
}

export type FlowchartEdge = Edge<FlowchartEdgeData>;

export default function RFFlowChartEdge({ id, data, markerEnd, ...props }: EdgeProps<FlowchartEdgeData>) {
  const changeEdgeLabel = useStore((state) => state.changeEdgeLabel);
  const [edgePath, labelX, labelY] = getBezierPath(props);

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      {/* For some reason, rendering the TextField makes the eiditor laggy*/}
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
          className="nopan"
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