
import { useEffect, useRef, useState } from "react";

type NodeEdgeEvent = {
  type: "node" | "edge";
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
  cancel: () => void;
  flush: () => T;
  isPending: boolean;
}

export type SaveHandler<T> = (store: ReturnEventStore) => T;


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
  const firstTimerId = useRef<ReturnType<typeof setInterval>>();
  const secondTimerId = useRef<ReturnType<typeof setInterval>>();
  const secondTimerRunning = useRef<boolean>(false);

  useEffect(() => {
    reset();
  }, [firstDelay, secondDelay]);

  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  function reset() {
    clearInterval(firstTimerId.current);
    clearInterval(secondTimerId.current);
    secondTimerRunning.current = false;
    setIsPending(false);

    eventStore.current = {
      nameChanged: false,
      nodeIds: new Set(),
      edgeIds: new Set(),
    };
  }

  function flush() {
    const result = funcRef.current({
      nameChanged: eventStore.current.nameChanged,
      nodeIds: Array.from(eventStore.current.nodeIds),
      edgeIds: Array.from(eventStore.current.edgeIds),
    });
    reset();
    return result;
  }

  function recordEvent(event: Event) {
    if (!secondTimerRunning.current) {
      secondTimerId.current = setInterval(flush, secondDelay);
      secondTimerRunning.current = true;
      setIsPending(true);
    }
    clearTimeout(firstTimerId.current);
    firstTimerId.current = setInterval(flush, firstDelay);

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
        break;
      }
    }
  }

  return {
    recordEvent,
    flush,
    cancel: reset,
    isPending
  }

}