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

type SelectionColors = {
  selected?: string;
  unselected?: string;
}


export default function FlowchartHandle({ position, id, colors, isSelected = false }: 
  { position: Position, id: string, colors?: SelectionColors, isSelected?: boolean }
) {
  const isHorizontal = position === Position.Left || position === Position.Right;

  const size = isHorizontal ? {
    width: "2px",
    height: "20px"
  } : {
    width: "25px",
    height: "2px"
  };

  const selectionColor = colors?.selected ?? "#000000";
  const notSelectedColor = colors?.unselected ?? "#000000";

  return (
    <Handle type="source" position={position} id={id} style={{
      ...size,
      borderRadius: "3px",
      background: isSelected ? selectionColor : notSelectedColor
    }} />
  )
}