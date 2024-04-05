import { ReactNode } from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import useToastMessage from "@/hooks/useToastMessage";
import { ToastMessageContext } from "@/hooks/useToastMessageContext";

export default function ToastMessageProvider({ children }: { children: ReactNode }) {
  const {isOpen, messageType, toastMessage, setToastMessage} = useToastMessage();

  function handleClose(event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    setToastMessage(null);
  }

  return (
    <>
      <ToastMessageContext.Provider value={setToastMessage}>
        {children}
      </ToastMessageContext.Provider>
      <Snackbar
        open={isOpen}
        autoHideDuration={messageType == "success" ? 1500 : 3000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={messageType}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}