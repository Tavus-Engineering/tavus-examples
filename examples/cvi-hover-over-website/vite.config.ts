import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api calls to the backend in server.js, which holds the Tavus API key.
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
