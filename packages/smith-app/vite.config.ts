import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/openai": {
        target: "https://api.x.ai/v1",
        // target: "https://api.openai.com/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai/, ""),
      },
    },
  },
});
