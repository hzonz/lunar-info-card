// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/lunar-info-card.js",
      formats: ["es"],
      fileName: () => "lunar-info-card.js",
    },
    outDir: "dist", 
    emptyOutDir: true,
    minify: "terser",
    terserOptions: {
      compress: { 
        drop_console: true, // 生产环境移除 console
        drop_debugger: true 
      }
    },
    rollupOptions: {
      // 如果你想让文件更小，可以取消下面三行的注释
      // external: [/^lit/], 
      // output: {
      //   globals: { lit: "lit" }
      // }
    }
  },
});
