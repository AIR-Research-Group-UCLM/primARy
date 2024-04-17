import { useState } from "react";

export type UseMutate<R> = {
  trigger: (args: any) => Promise<R>;
  isMutating: boolean;
}

export default function useMutate<R, A>(mutator: (args: A) => Promise<R>): UseMutate<R> {
  const [isMutating, setIsMutating] = useState<boolean>(false);

  async function trigger(args: A) {
    setIsMutating(true);
    const result = await mutator(args);
    setIsMutating(false);
    return result;
  }

  return {
    isMutating,
    trigger,
  }

}