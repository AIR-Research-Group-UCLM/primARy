import type { Edge } from "./types";

export class UnsuccessfulResponse extends Error {
  info: any;
  status: number;

  constructor(message: string, info: any, status: number) {
    super(message);
    this.info = info;
    this.status = status;
  }
}

// source: https://swr.vercel.app/docs/error-handling
export async function defaultFetcher<S>(url: string) {
  return JSONfetcher<S>(url);
}

export function noInitialSpace(value: string): string {
  return value.trim() !== "" ? value : "";
}

export function groupEdges(edges: Edge[]) {
  const map = new Map<string, Edge[]>()
  for (const edge of edges) {
    const neighbourEdges = map.get(edge.source);
    if (neighbourEdges === undefined) {
      map.set(edge.source, [edge]);
    } else {
      neighbourEdges.push(edge);
    }
  }
  return map;
}

// TODO: do not retray on 404 errors
export async function fetcher<E = any>(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const info = await res.json() as E;
    throw new UnsuccessfulResponse(
      res.statusText,
      info,
      res.status
    )
  }
  return res;
}

export async function JSONfetcher<S = void, E = any>(url: string, options?: RequestInit): Promise<S> {
  const res = await fetcher<E>(url, options);
  return res.json();
}