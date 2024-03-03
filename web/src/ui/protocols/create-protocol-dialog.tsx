import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  handleClose?: () => void;
  onCreateClick?: (name: string) => void;
};

export default function CreateProtocolDialog({ isOpen, handleClose, onCreateClick }: Props) {
  const [text, setText] = useState<string>("");

  return (
    <Dialog
      open={isOpen}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
    >
      <DialogTitle>
        Create Protocol
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Type the new protocol's name
        </DialogContentText>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          margin="dense"
          fullWidth
          variant="standard"
          label="Protocol's name"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="medium"
          sx={{
            borderRadius: "30px"
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onCreateClick?.(text)}
          variant="contained"
          size="medium"
          disabled={text.trim().length == 0}
          sx={{
            borderRadius: "30px"
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}