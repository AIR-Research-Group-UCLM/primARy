import { createContext, useContext } from "react";
import { type SaveEventsReturns } from "@/hooks/useSaveEvents";

// TODO: Find a way of making the type parameter generic when defining a context
export const SaveEventsContext = createContext<SaveEventsReturns<void> | null>(null);

export default function useSaveEventsContext() {
  const saveEvents = useContext(SaveEventsContext);
  if (saveEvents == null) {
    throw new Error("No save events provider has been found")
  }
  return saveEvents;
}