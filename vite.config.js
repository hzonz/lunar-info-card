// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/lunar-info-card.js",
      formats: ["es"],
      fileName: () => "lunar-info-card.js",
    },
    outDir: ".", 
    emptyOutDir: false,
    minify: "terser",
  },
});
