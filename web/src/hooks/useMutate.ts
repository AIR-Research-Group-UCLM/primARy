import { useState } from "react";

export default function useMutate<T, A>(mutator: (args: A) => Promise<T>) {
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