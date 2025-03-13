import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias pour le dossier src
    },
  },
  server: {
    host: "0.0.0.0", // Permet d'accéder au frontend depuis l'extérieur du container
    port: 5174,
    strictPort: true,
    watch: {
      usePolling: true, // Pour éviter les problèmes avec Docker sur Windows/macOS
    },
    proxy: {
      "/api": {
        target: "http://localhost:3011", // ✅ API du backend TestRunner
        changeOrigin: true,
        secure: false,
        //rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['tabulator-tables'],
  },
});
