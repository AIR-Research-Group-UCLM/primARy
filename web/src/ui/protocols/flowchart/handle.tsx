import { Position, Handle } from "reactflow";

export type HandlePosition = "top" | "bottom" | "left" | "right";

const opposite = {
  "top": "bottom",
  "bottom": "top",
  "left": "right",
  "right": "left"
}

const defaultColor = "black";

export function getOpposite(position: HandlePosition) {
  return opposite[position];
}

type SelectionColors = {
  selected?: string;
  selectedModification?: string;
  unselected?: string;
}

type Props = {
  position: Position;
  id: string;
  colors?: SelectionColors;
  isSelected: boolean;
  isSelectedModification: boolean;
}

function selectColor(selected: boolean, selectedModification: boolean, colors?: SelectionColors) {
  const selectionColor = colors?.selected ?? defaultColor;
  const selectedModificationColor = colors?.selectedModification ?? defaultColor;
  const notSelectedColor = colors?.unselected ?? defaultColor;

  if (selectedModification) {
    return selectedModificationColor;
  }

  if (selected) {
    return selectionColor;
  }

  return notSelectedColor;
}


export default function FlowchartHandle({ position, id, colors, isSelected = false, isSelectedModification = false }: Props) {
  const isHorizontal = position === Position.Left || position === Position.Right;

  const size = isHorizontal ? {
    width: "5px",
    height: "20px"
  } : {
    width: "25px",
    height: "5px"
  };

  return (
    <Handle type="source" position={position} id={id} style={{
      ...size,
      borderRadius: "3px",
      background: `${selectColor(isSelected, isSelectedModification, colors)}`
    }} />
  )
}