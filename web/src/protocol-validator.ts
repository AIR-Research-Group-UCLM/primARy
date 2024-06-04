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
    nodeName: string;
    repeatedOptions: {
      option: string;
      count: number;
    }[];
  }[]
}

type BlankOptionResult = {
  type: "BlankOption";
  nodeNames: string[];
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

export function checkBlankOptions(nodesData: Map<string, NodeData>, edges: Edge[]): BlankOptionResult {
  const nodeEdges = Array.from(
    Map.groupBy(edges, (edge) => edge.source),
    ([nodeId, edges]) =>
    ({
      nodeName: nodesData.get(nodeId)!.name,
      options: edges.map((edge) => edge.label.trim())
    })
  );

  const nodeNames = nodeEdges.filter(({ options }) =>
    options.length > 1 && options.some((option) => option === "")
  ).map(({ nodeName }) => nodeName);

  return {
    type: "BlankOption",
    nodeNames
  }
}

export function checkRepeatedAnswer(nodesData: Map<string, NodeData>, edges: Edge[]): RepeatedOptionResult {
  const nodeEdges = Array.from(
    Map.groupBy(edges, (edge) => edge.source),
    ([nodeId, edges]) =>
    ({
      nodeName: nodesData.get(nodeId)!.name,
      options: edges.map((edge) => edge.label.trim())
    })
  );

  const info = nodeEdges.map(({ nodeName, options }) => ({
    nodeName,
    repeatedOptions: countRepeatedOptions(nodeName, options)
  })).filter(({ repeatedOptions }) => repeatedOptions.length !== 0);

  return {
    type: "RepeatedOption",
    info
  }
}

export function applyAllValidators(nodesData: Map<string, NodeData>, edges: Edge[]): ValidatorResult[] {
  return [
    checkUndefinedNodes(Array.from(nodesData.values())),
    checkRepeatedAnswer(nodesData, edges),
    checkBlankOptions(nodesData, edges)
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
      return validatorResult.nodeNames.length > 0
    }
  }
}

function countRepeatedOptions(nodeName: string, options: string[]) {
  const optionCount = new Map<string, number>();
  for (const option of options) {
    const count = optionCount.get(option);
    optionCount.set(option, count === undefined ? 1 : count + 1);
  }

  const repeatedOptions = Array.from(optionCount)
    .filter(([option, count]) => option !== "" && count > 1)
    .map(([option, count]) => ({ option, count }));

  return repeatedOptions;
}