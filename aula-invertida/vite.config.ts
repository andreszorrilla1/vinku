import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build:artifact` empaqueta todo en un solo index.html
// (para publicarlo como página de claude.ai, donde la IA usa la capacidad `sample`).
export default defineConfig(({ mode }) => ({
  plugins: mode === "artifact" ? [react(), viteSingleFile()] : [react()],
  base: "./",
  server: { port: 5175 },
  build: { outDir: mode === "artifact" ? "dist-artifact" : "dist" },
}));
