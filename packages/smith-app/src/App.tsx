import { Provider } from "jotai";
import styles from "./App.module.css";
import { Chat } from "./chat/Chat.tsx";

function App() {
  return (
    <Provider>
      <main className={styles.div}>
        <Chat />
      </main>
    </Provider>
  );
}

export default App;
