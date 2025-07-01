import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import webExtension from "vite-plugin-web-extension";

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      browser: process.env.TARGET || "chrome",
      webExtConfig: {
        startUrl: ["https://example.com"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    __BROWSER__: JSON.stringify(process.env.TARGET || "chrome"),
  },
});
