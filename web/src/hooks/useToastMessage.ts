import { useState } from "react";

type MessageType = "success" | "error";

export default function useToastMessage() {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [messageType, setMessageType] = useState<MessageType>("success");
  const [toastMessage, setToastMessage] = useState<string>("");

  function setMessage(arg: { type: MessageType, message: string } | null) {
    if (arg !== null) {
      setIsOpen(true);
      setToastMessage(arg.message);
      setMessageType(arg.type);
    } else {
      setIsOpen(false);
    }
  }

  return {
    isOpen,
    toastMessage,
    messageType,
    setToastMessage: setMessage
  }
}