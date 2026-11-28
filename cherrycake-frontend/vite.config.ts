import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/v3/api-docs": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/swagger-ui": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/swagger-ui.html": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
