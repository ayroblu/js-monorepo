import type { Atom } from "jotai";
import { atom } from "jotai";
import { api } from "./agent.ts";

export const messagesAtom = atom<Atom<Message>[]>([]);
export type Message = {
  role: "user" | "assistant";
  content: string;
};
export const hasMessagesAtom = atom<boolean>(
  (get) => !!get(messagesAtom).length,
);

export const sendMessageAtom = atom(null, async (get, set) => {
  const message = get(inputAtom).trim();
  if (!message) return;
  set(inputAtom, "");
  const pastMessages = get(messagesAtom).map((messageAtom) => get(messageAtom));
  const messageAtom = atom({ role: "assistant" as const, content: "" });
  set(messagesAtom, (m) =>
    m.concat(atom({ role: "user" as const, content: message })),
  );
  set(messagesAtom, (m) => m.concat(messageAtom));

  const input = pastMessages.concat({ role: "assistant", content: message });
  for await (const response of api.response(input)) {
    set(messageAtom, (m) => ({ ...m, content: m.content + response }));
  }
});

export const inputAtom = atom("");
