import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The backend has no CORS middleware, so in dev we proxy /api/* -> backend.
// Backend port comes from the project's .env (PORT = 8080).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
