
import { useEffect, useRef, useState } from "react";

type NodeEdgeEvent = {
  type: "edge" | "node";
  id: string;
}

type NameEvent = {
  type: "name"
}

type Event = NameEvent | NodeEdgeEvent;

type EventStore = {
  nameChanged: boolean;
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

export type ReturnEventStore = {
  nameChanged: boolean;
  nodeIds: string[];
  edgeIds: string[];
}

export type SaveEventsReturns<T = any> = {
  recordEvent: (event: Event) => void;
  cancelEvent: (event: Event) => void;
  flush: () => Promise<T>;
  isPending: boolean;
}

export type SaveHandler<T> = (store: ReturnEventStore) => Promise<T>;


export default function useSaveEvents<T>(
  func: SaveHandler<T>,
  firstDelay: number,
  secondDelay: number
): SaveEventsReturns<T> {
  const eventStore = useRef<EventStore>({
    nameChanged: false,
    nodeIds: new Set<string>(),
    edgeIds: new Set<string>(),
  });

  const [isPending, setIsPending] = useState<boolean>(false);
  const funcRef = useRef<SaveHandler<T>>(func);
  const firstTimerId = useRef<ReturnType<typeof setTimeout>>();
  const secondTimerId = useRef<ReturnType<typeof setTimeout>>();
  const secondTimerRunning = useRef<boolean>(false);

  useEffect(() => {
    cancel();
  }, [firstDelay, secondDelay]);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  function clearTimeouts() {
    clearTimeout(firstTimerId.current);
    clearTimeout(secondTimerId.current);
    secondTimerRunning.current = false;
    setIsPending(false);
  }

  function cancel() {
    clearTimeouts();
    eventStore.current = {
      nameChanged: false,
      nodeIds: new Set(),
      edgeIds: new Set(),
    };
  }

  async function flush() {
    clearTimeouts();
    const result = await funcRef.current({
      nameChanged: eventStore.current.nameChanged,
      nodeIds: Array.from(eventStore.current.nodeIds),
      edgeIds: Array.from(eventStore.current.edgeIds),
    });

    eventStore.current = {
      nameChanged: false,
      nodeIds: new Set(),
      edgeIds: new Set(),
    };

    return result;
  }

  function cancelEvent(event: Event) {
    switch (event.type) {
      case "node": {
        eventStore.current.nodeIds.delete(event.id);
        break;
      }
      case "edge": {
        eventStore.current.edgeIds.delete(event.id);
        break;
      }
      case "name": {
        eventStore.current.nameChanged = false;
      }
    }
  }

  function recordEvent(event: Event) {
    if (!secondTimerRunning.current) {
      secondTimerId.current = setTimeout(flush, secondDelay);
      secondTimerRunning.current = true;
      setIsPending(true);
    }

    clearTimeout(firstTimerId.current);
    firstTimerId.current = setTimeout(flush, firstDelay);

    switch (event.type) {
      case "node": {
        eventStore.current.nodeIds.add(event.id);
        break;
      }
      case "edge": {
        eventStore.current.edgeIds.add(event.id);
        break;
      }
      case "name": {
        eventStore.current.nameChanged = true;
      }
    }
  }

  return {
    recordEvent,
    flush,
    cancelEvent,
    isPending
  }

}