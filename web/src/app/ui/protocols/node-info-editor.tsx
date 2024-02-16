import TextField from "@mui/material/TextField";
import useStore, { RFState } from "@/app/protocols/store";

import "@/app/ui/protocols/textfield.css";

type Props = {
  selectedNodeId: string
}

export default function NodeInfoEditor({ selectedNodeId }: Props) {
  const changeNodeData = useStore((state) => state.changeNodeData);
  const data = useStore((state) => state.nodesData.get(selectedNodeId)!);

  function onNameChange(name: string) {
    changeNodeData(selectedNodeId, { name });
  }

  function onDescriptionChange(description: string) {
    changeNodeData(selectedNodeId, { description });
  }

  return (
    <>
      <TextField
        fullWidth
        label="Name"
        value={data.name}
        onChange={(e) => onNameChange(e.target.value)}
        variant="outlined"
        sx={{
          marginBottom: "10px"
        }}
      />
      <TextField
        fullWidth
        multiline
        onChange={(e) => onDescriptionChange(e.target.value)}
        value={data.description ?? ""}
        id="description"
        label="Description"
        variant="outlined"
        // TODO: this should not depend on a hardcoded value but
        // on the dimensions of the textarea
        maxRows={19}
        InputProps={{
          sx: {
            height: "100%",
            alignItems: "normal",
          }
        }}
      />
    </>
  );
}