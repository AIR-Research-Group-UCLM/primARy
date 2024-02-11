import TextField from "@mui/material/TextField";

import type { FlowchartNode } from "@/app/ui/protocols/flowchart/node";

import "@/app/ui/protocols/textfield.css";

type Props = {
  selectedNode: FlowchartNode
}


export default function NodeInfoEditor({ selectedNode }: Props) {
  return (
    <>
      <TextField
        fullWidth
        label="Name"
        value={selectedNode.data.label}
        variant="outlined"
        sx={{
          marginBottom: "10px"
        }}
      />
        <TextField
          fullWidth
          multiline
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