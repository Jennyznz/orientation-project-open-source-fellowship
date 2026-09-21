import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Use Uvicorn's default IPv4 address; localhost can resolve to IPv6 on Windows.
// Proxies /api calls to the FastAPI backend during local dev,
// so the frontend can just call fetch("/api/...").
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
