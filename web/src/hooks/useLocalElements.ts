import { useRef } from "react";

export type LocalElement = {
  addLocalId: (elementId: string) => void;
  removeLocalId: (elementId: string) => boolean;
  isLocalId: (elementId: string) => boolean;
}

export default function useLocalElement() {
  const elementsIds = useRef<Set<string>>(new Set);

  function addLocalId(elementId: string) {
    elementsIds.current.add(elementId);
  }

  function removeLocalId(elementId: string): boolean {
    return elementsIds.current.delete(elementId);
  }

  function isLocalId(elementId: string) {
    return elementsIds.current.has(elementId);
  }

  return {
    addLocalId, removeLocalId, isLocalId
  }

}