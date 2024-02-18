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
    name: string;
    nodes: Node[];
    edges: Edge[];
}


