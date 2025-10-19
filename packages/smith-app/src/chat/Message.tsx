import type { Atom } from "jotai";
import { useAtomValue } from "jotai";
import { cn } from "../utils.ts";
import styles from "./Message.module.css";
import type { Message } from "./state.ts";

export function Message({
  messageAtom,
}: {
  messageAtom: Atom<Message>;
}): React.ReactNode {
  const message = useAtomValue(messageAtom);
  if (!message.content) {
    return;
  }
  return (
    <div
      className={cn(
        styles.message,
        message.role == "user" ? styles.user : styles.assistant,
      )}
    >
      {message.content}
    </div>
  );
}
