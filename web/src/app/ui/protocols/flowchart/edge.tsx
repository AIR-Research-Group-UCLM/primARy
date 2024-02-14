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
  label: string;
  doubleClickSelected: boolean;
}

export type FlowchartEdge = Edge<FlowchartEdgeData>;

type EdgeTextFieldProps = {
  edgeId: string;
  label: string;
  labelX: number;
  labelY: number;
  isError: boolean;
  onFocusChange: () => void;
}

function EdgeTextField( { edgeId, label, labelX, labelY, isError, onFocusChange }: EdgeTextFieldProps ) {
  const changeEdgeLabel = useStore((state) => state.changeEdgeLabel);

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
      onChange={(e) => changeEdgeLabel(edgeId, e.target.value)}
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

export default function RFFlowChartEdge({ id, data, markerEnd, source, ...props }: EdgeProps<FlowchartEdgeData>) {

  const edges = useStore((state) => state.edges);
  const [edgePath, labelX, labelY] = getBezierPath(props);

  const sourceCount = edges.filter((edge) => edge.source === source).length;

  const label = data?.label ?? "";
  const shouldTextFieldRender = sourceCount >= 2 || (label !== "");

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      {/* For some reason, rendering the TextField makes the eiditor laggy*/}
      <EdgeLabelRenderer>
        {shouldTextFieldRender && 
        <EdgeTextField
          edgeId={id}
          label={data?.label ?? ""}
          labelX={labelX}
          labelY={labelY}
          isError={label === ""}
          onFocusChange={() => console.log("Focus")}
          />
        }
      </EdgeLabelRenderer>
    </>
  );
}