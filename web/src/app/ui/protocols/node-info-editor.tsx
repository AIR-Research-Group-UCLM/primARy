import TextField from "@mui/material/TextField";
import useStore from "@/app/protocols/store";

import type { FlowchartNode } from "@/app/ui/protocols/flowchart/node";

import "@/app/ui/protocols/textfield.css";

type Props = {
  selectedNode: FlowchartNode
}

export default function NodeInfoEditor({ selectedNode }: Props) {
  const changeNodeData = useStore((state) => state.changeNodeData);
  const setSelectedNode = useStore((state) => state.setSelectedNode);

  function onNameChange(name: string) {
    const newNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        name
      }
    }

    changeNodeData(selectedNode.id, { name });
    setSelectedNode(newNode);
  }

  function onDescriptionChange(description: string) {
    const newNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        description
      }
    }

    changeNodeData(selectedNode.id, { description });
    setSelectedNode(newNode);
  }

  return (
    <>
      <TextField
        fullWidth
        label="Name"
        value={selectedNode.data.name}
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
        value={selectedNode.data.description ?? ""}
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