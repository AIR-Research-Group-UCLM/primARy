import { createContext, useContext, ReactNode } from "react";
import { LocalEdgesNodesContext } from "@/providers/local-edges-nodes";

export default function useLocalEdgesNodes() {
  const localElements = useContext(LocalEdgesNodesContext);
  if (localElements == null) {
    throw new Error("No save events provider has been found")
  }
  return localElements;
}
