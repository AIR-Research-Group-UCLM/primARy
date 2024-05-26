import { ReactNode, createContext } from "react";
import useLocalElement, { LocalElement } from "@/hooks/useLocalElements";

export const LocalEdgesNodesContext = createContext<LocalEdgeNodes | null>(null);

export type LocalEdgeNodes = {
  localEdges: LocalElement;
  localNodes: LocalElement;
}

export default function LocalEdgesNodesProvider({ children }: { children: ReactNode }) {
  const localEdges = useLocalElement();
  const localNodes = useLocalElement();

  return (
    <LocalEdgesNodesContext.Provider value={{ localEdges, localNodes }}>
      {children}
    </LocalEdgesNodesContext.Provider>
  );
}