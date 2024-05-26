import { createContext, useContext } from "react";
import { type SaveEventsReturns } from "@/hooks/useSaveEvents";

export const SaveEventsContext = createContext<SaveEventsReturns | null>(null);

export default function useSaveEventsContext() {
  const saveEvents = useContext(SaveEventsContext);
  if (saveEvents == null) {
    throw new Error("No save events provider has been found")
  }
  return saveEvents;
}