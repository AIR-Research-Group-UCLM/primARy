import Dialog from "@mui/material/Dialog";
import useProtocolStore from "@/hooks/store";

type Props = {
  isOpen: boolean;
  selectedNodeId: string;
  handleClose?: () => void;
}

export default function NodeResourcesDialog(
  { isOpen, selectedNodeId, handleClose }: Props
) {
  const name = useProtocolStore((state) => state.nodesData.get(selectedNodeId)!.name);

  return (
    <Dialog
      open={isOpen}
      fullWidth
      maxWidth="md"
    >
    </Dialog>);
}