import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Forward /api calls to the backend in server.js, which holds the Tavus API key.
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
})
