import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export default defineConfig({
  server: { host: true, port: 8080 },
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  build: {
    target: "safari15",
    sourcemap: false,
    chunkSizeWarningLimit: 700, // one bundle is right for an app loaded from disk
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
