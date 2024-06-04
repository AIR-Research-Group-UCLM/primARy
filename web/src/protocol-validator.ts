import { NodeData, Edge } from "@/types";

export type ValidatorResult =
  UndefinedNodeResult |
  RepeatedOptionResult |
  BlankOptionResult;

type UndefinedNodeResult = {
  type: "UndefinedNodes";
  count: number;
}

type RepeatedOptionResult = {
  type: "RepeatedOption";
  info: {
    nodeId: string;
    repeatedOptions: {
      option: string;
      edgeIds: string[];
    }[];
  }[]
}

type BlankOptionResult = {
  type: "BlankOption";
  nodeIds: string[];
}

export function checkUndefinedNodes(nodesData: NodeData[]): UndefinedNodeResult {
  let count = 0;
  for (const nodeData of nodesData) {
    if (nodeData.name === "") {
      count += 1;
    }
  }
  return {
    type: "UndefinedNodes",
    count
  }
}

export function checkBlankOptions(edges: Edge[]): BlankOptionResult {
  const nodeEdges = Array.from(
    Map.groupBy(edges, (edge) => edge.source),
    ([nodeId, edges]) =>
    ({
      nodeId,
      options: edges.map((edge) => edge.label.trim())
    })
  );

  const nodeIds = nodeEdges.filter(({ options }) =>
    options.length > 1 && options.some((option) => option === "")
  ).map(({ nodeId }) => nodeId);

  return {
    type: "BlankOption",
    nodeIds
  }
}

export function checkRepeatedOptions(edges: Edge[]): RepeatedOptionResult {
  const nodeEdges = Array.from(
    Map.groupBy(edges, (edge) => edge.source),
    ([nodeId, edges]) =>
    ({
      nodeId,
      edges
    })
  );

  const info = nodeEdges.map(({ nodeId, edges }) => ({
    nodeId,
    repeatedOptions: countRepeatedOptions(edges)
  })).filter(({ repeatedOptions }) => repeatedOptions.length !== 0);

  return {
    type: "RepeatedOption",
    info
  }
}

export function applyAllValidators(nodesData: Map<string, NodeData>, edges: Edge[]): ValidatorResult[] {
  return [
    checkUndefinedNodes(Array.from(nodesData.values())),
    checkRepeatedOptions(edges),
    checkBlankOptions(edges)
  ].filter(isValidationError);
}

function isValidationError(validatorResult: ValidatorResult) {
  switch (validatorResult.type) {
    case "UndefinedNodes": {
      return validatorResult.count > 0;
    }
    case "RepeatedOption": {
      return validatorResult.info.length > 0;
    }
    case "BlankOption": {
      return validatorResult.nodeIds.length > 0
    }
  }
}

function countRepeatedOptions(edges: Edge[]) {
  const optionEdgeIds = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.label === "") {
      continue;
    }

    const edgeIds = optionEdgeIds.get(edge.label);
    if (edgeIds === undefined) {
      optionEdgeIds.set(edge.label, [edge.id])
    } else {
      edgeIds.push(edge.id);
    }
  }

  const repeatedOptions = Array.from(optionEdgeIds)
    .map(([option, edgeIds]) => ({ option, edgeIds }));

  return repeatedOptions;
}