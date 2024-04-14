// https://gist.github.com/nestarz/1fa7ae93fb83f1eafb1b88c3a84f2e02

export function splitStream(splitOn: string): TransformStream<string, string> {
  let buffer = "";
  return new TransformStream({
    transform(chunk, controller) {
      buffer += chunk;
      const parts = buffer.split(splitOn);
      for (const part of parts.slice(0, -1)) {
        controller.enqueue(part);
      }
      buffer = parts[parts.length - 1];
    },
    flush(controller) {
      if (buffer !== "") {
        controller.enqueue(buffer);
      }
    }
  })
}

export function parseJSON<T = any>(): TransformStream<string, T> {
  return new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(JSON.parse(chunk));
    }
  })
}