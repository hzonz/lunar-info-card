import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: ".",        // 输出到根目录
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
