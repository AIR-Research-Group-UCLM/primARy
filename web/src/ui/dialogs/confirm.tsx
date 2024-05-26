import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

type Props = {
  isOpen: boolean;
  title: string;
  contentText: string;
  action: string;
  onActionClick?: () => void;
  onCancelClick?: () => void;
}

export default function ConfirmDialog(
  {
    isOpen, title, contentText, action, onActionClick, onCancelClick
  }: Props
) {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancelClick}
    >
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancelClick}
          variant="outlined"
          size="medium"
          sx={{
            borderRadius: "30px"
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onActionClick}
          variant="contained"
          size="medium"
          sx={{
            borderRadius: "30px"
          }}
        >
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}