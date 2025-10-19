import { Provider } from "jotai";
import styles from "./App.module.css";
import { Chat } from "./chat/Chat.tsx";

function App() {
  return (
    <main className={styles.div}>
      <div>hi</div>
      <Chat />
    </main>
  );
}

export default App;
