import { createContext, useContext } from "react";
import { type Message } from "@/hooks/useToastMessage";

export const ToastMessageContext = createContext<((message: Message) => void) | null>(null);

export default function useToastMessageContext() {
  const saveEvents = useContext(ToastMessageContext);
  if (saveEvents == null) {
    throw new Error("No toast message context has been found");
  }
  return saveEvents;
}