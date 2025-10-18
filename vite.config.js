import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: ".",
    emptyOutDir: false, // 避免清空其他文件
    lib: {
      entry: "src/lunar-info-card.js",
      name: "LunarInfoCard",
      fileName: "lunar-info-card",
      formats: ["es"]
    },
    rollupOptions: {
      external: [],
    }
  }
});
