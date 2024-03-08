import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import useProtocolStore from "@/hooks/store";

import "@/ui/protocols/textfield.css";
import { Button } from "@mui/material";

type Props = {
  selectedNodeId: string
}

export default function NodeInfoEditor({ selectedNodeId }: Props) {
  const changeNodeData = useProtocolStore((state) => state.changeNodeData);
  const data = useProtocolStore((state) => state.nodesData.get(selectedNodeId)!);

  function onNameChange(name: string) {
    changeNodeData(selectedNodeId, { name });
  }

  function onDescriptionChange(description: string) {
    changeNodeData(selectedNodeId, { description });
  }

  return (
    <Paper
      elevation={5}
      sx={{
        flex: "1 0",
        border: "solid 1px",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        maxRows={10}
        InputProps={{
          sx: {
            height: "100%",
            alignItems: "normal",
            overflow: "scroll"
          }
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px"
        }}
      >
        <Button
          variant="contained"
          size="medium"
          sx={{
            borderRadius: "30px"
          }}
          startIcon={<LibraryBooksIcon />}
        >
          Add resources
        </Button>
      </Box>
    </Paper>
  );
}