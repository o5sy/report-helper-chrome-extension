import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import webExtension from "vite-plugin-web-extension";

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: "manifest.json",
      assets: "public",
      browser: "chrome",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
