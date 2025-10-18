// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: ".",          // 输出到根目录
    emptyOutDir: false,   // 避免删除其他文件
    lib: {
      entry: "src/lunar-info-card.js",
      name: "LunarInfoCard",
      fileName: "lunar-info-card",
      formats: ["es"]
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,  // ← 关键，所有依赖打包到一个文件
      }
    }
  }
});
