export function lazy<T>(f: () => T): () => T {
  let v: null | { value: T } = null;
  return () => {
    if (v === null) {
      const result = f();
      v = { value: result };
      return result;
    }
    return v.value;
  };
}
