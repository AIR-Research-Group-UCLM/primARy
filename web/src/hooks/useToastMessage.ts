import { useState } from "react";

type MessageType = "success" | "error";
export type Message = {
  type: MessageType;
  text: string;
}

export type ToastMessageReturn = {
  isOpen: boolean;
  toastMessage: string;
  messageType: MessageType,
  setToastMessage: (message: Message | null) => void;
}

export default function useToastMessage(): ToastMessageReturn {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messageType, setMessageType] = useState<MessageType>("success");
  const [toastMessage, setToastMessage] = useState<string>("");

  function setMessage(message: Message | null) {
    if (message !== null) {
      setIsOpen(true);
      setToastMessage(message.text);
      setMessageType(message.type);
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