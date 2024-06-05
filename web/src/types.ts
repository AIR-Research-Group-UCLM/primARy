export type Position = {
    x: number;
    y: number;
}

export type NodeData = {
    name: string;
    description: string;
    requiredEdgesIds: string[];
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
    id: string;
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
    id: string;
    name: string;
}

export type UserFile = {
    id: string;
    filename: string;
    name: string;
    size: number;
}

export type LLMResponse = {
    text: string;
}

export type GenerationMode = "multistep" | "concatenate";