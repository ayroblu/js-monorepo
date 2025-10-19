import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import styles from "./Chat.module.css";
import { Message } from "./Message.tsx";
import { SendIcon } from "./SendIcon.tsx";
import {
  hasMessagesAtom,
  inputAtom,
  messagesAtom,
  sendMessageAtom,
} from "./state.ts";

export function Chat() {
  const hasMessages = useAtomValue(hasMessagesAtom);
  return null;
  if (hasMessages) {
    return <FullChat />;
  }
  return <Home />;
}

function Home() {
  return (
    <div className={styles.home}>
      <h1>Chat</h1>
      <InputBox />
    </div>
  );
}

function FullChat() {
  const messages = useAtomValue(messagesAtom);
  const { sourceRef, destRef } = useMatchHeight();

  return (
    <div className={styles.chat}>
      <h3>Chat</h3>
      <div className={styles.chatContainer}>
        {messages.map((messageAtom, i) => (
          <Message key={i} messageAtom={messageAtom} />
        ))}
      </div>
      <div ref={destRef} />
      <div className={styles.bottomFixed} ref={sourceRef}>
        <InputBox />
      </div>
    </div>
  );
}

function useMatchHeight() {
  const sourceRef = useRef<null | HTMLDivElement>(null);
  const destRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => {
    if (!sourceRef.current || !destRef.current) return;
    const source = sourceRef.current;
    const dest = destRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        dest.style.height = height + "px";
      }
    });

    // Start observing the element
    resizeObserver.observe(source);

    // Return the observer in case you need to disconnect it later
    return () => resizeObserver.unobserve(source);
  }, []);
  return { sourceRef, destRef };
}

function InputBox() {
  const [input, setInput] = useAtom(inputAtom);
  const handleSendMessage = useSetAtom(sendMessageAtom);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  return (
    <div className={styles.inputBox}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className={styles.input}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <button className={styles.sendButton} onClick={handleSendMessage}>
        <SendIcon />
      </button>
    </div>
  );
}
