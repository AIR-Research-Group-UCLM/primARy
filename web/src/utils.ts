
class UnsuccessfulResponse extends Error {
  info: any;
  status: number;

  constructor(message: string, info: any, status: number) {
    super(message);
    this.info = info;
    this.status = status;
  }
}

// source: https://swr.vercel.app/docs/error-handling
export async function defaultFetcher(url: string) {
  const res = await fetch(url)

  if (!res.ok) {
    const info = await res.json();
    const error = new UnsuccessfulResponse("Unsucessfull response", info, res.status);
    throw error
  }

  return res.json();
}