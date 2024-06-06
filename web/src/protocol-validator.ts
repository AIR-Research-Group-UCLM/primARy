import { NodeData, Edge } from "@/types";
import { groupEdges } from "./utils";

export type ValidatorResult =
  UndefinedNodeResult |
  RepeatedOptionResult |
  BlankOptionResult;

export type UndefinedNodeResult = {
  type: "UndefinedNodes";
  count: number;
}

export type RepeatedOptionResult = {
  type: "RepeatedOption";
  infos: {
    nodeId: string;
    repeatedOptions: {
      option: string;
      edgeIds: string[];
    }[];
  }[]
}

export type BlankOptionResult = {
  type: "BlankOption";
  infos: {
    nodeId: string;
    blankOptions: Edge[]
  }[]
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
    groupEdges(edges),
    ([nodeId, edges]) =>
    ({
      nodeId,
      edges
    })
  );

  const infos = nodeEdges.map(({ nodeId, edges }) => ({
    nodeId,
    blankOptions: edges.length > 1 ? edges.filter((edge) => edge.label.trim() === "") : []
  })).filter(({ blankOptions }) => blankOptions.length > 0);

  return {
    type: "BlankOption",
    infos
  }
}

export function checkRepeatedOptions(edges: Edge[]): RepeatedOptionResult {
  const nodeEdges = Array.from(
    groupEdges(edges),
    ([nodeId, edges]) =>
    ({
      nodeId,
      edges
    })
  );

  const infos = nodeEdges.map(({ nodeId, edges }) => ({
    nodeId,
    repeatedOptions: countRepeatedOptions(edges)
  })).filter(({ repeatedOptions }) => repeatedOptions.length !== 0);

  return {
    type: "RepeatedOption",
    infos
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
      return validatorResult.infos.length > 0;
    }
    case "BlankOption": {
      return validatorResult.infos.length > 0
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
    .map(([option, edgeIds]) => ({ option, edgeIds }))
    .filter(({ edgeIds }) => edgeIds.length > 1);

  return repeatedOptions;
}