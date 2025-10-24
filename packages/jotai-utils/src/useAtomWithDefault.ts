import { useAtomValue, type WritableAtom } from "jotai";
import { useState } from "react";
import { useJotaiStore } from "./useJotaiStore.ts";

export function useAtomWithDefault<T>(
  atom: WritableAtom<T, [T], unknown>,
  value: T,
) {
  const store = useJotaiStore();
  useState(() => store.set(atom, value));
  return useAtomValue(atom);
}
