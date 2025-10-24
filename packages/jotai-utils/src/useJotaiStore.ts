import { useStore } from "jotai";

export type JotaiStore = ReturnType<typeof useStore>;
export function useJotaiStore(): JotaiStore {
  return useStore();
}
