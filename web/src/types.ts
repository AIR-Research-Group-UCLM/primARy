export type Position = {
    x: number;
    y: number;
}

export type NodeData = {
    name: string;
    description: string;
}

export type Node = {
    id: string;
    position: Position;
    data: NodeData;
}

export type Edge = {
    id: string;
    source: string;
    target: string;
    label: string;
    sourceHandle: string;
    targetHandle: string;
}

export type Protocol = {
    id: number;
    initialNodeId: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
}

export type ProtocolUpsert = {
    name?: string;
    nodes?: Node[];
    edges?: Edge[];
}

export type ProtocolSummary = {
    id: number;
    name: string;
}

export type UserFile = {
   id: number; 
   filename: string;
   name: string;
   size: number;
}

export type LLMResponse = {
    text: string;
}