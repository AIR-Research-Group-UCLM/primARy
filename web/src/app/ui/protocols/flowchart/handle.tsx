import { Position, Handle } from "reactflow";

export type HandlePosition = "top" | "bottom" | "left" | "right";

const opposite = {
  "top": "bottom",
  "bottom": "top",
  "left": "right",
  "right": "left"
}

export function getOpposite(position: HandlePosition) {
  return opposite[position];
}

export default function FlowChartHandle({ position, id }: { position: Position, id: string }) {
  const isHorizontal = position === Position.Left || position === Position.Right;

  const size = isHorizontal ? {
    width: "2px",
    height: "20px"
  } : {
    width: "25px",
    height: "2px"
  };

  return (
    <Handle type="source" position={position} id={id} style={{
      ...size,
      borderRadius: "3px",
      background: "#000000",
    }} />
  )
}