import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias pour le dossier src
    },
  },
  server: {
    host: "0.0.0.0", // Permet d'accéder au frontend depuis l'extérieur du conteneur
    port: 5173, // Port du frontend
    strictPort: true, // Force l'utilisation du port 5173
    watch: {
      usePolling: true, // Nécessaire pour Docker sous Windows/macOS
    },
    proxy: {
      // Redirige toutes les requêtes /api vers le backend
      '/api': {
        //target: 'http://waspl-editor:4000',
        target: 'http://localhost:4000', // URL du backend dans le réseau Docker
        changeOrigin: true, // Nécessaire pour les requêtes cross-origin
        rewrite: (path) => path.replace(/^\/api/, ''), // Supprime le préfixe /api
      },
    },
  },
  build: {
    outDir: "dist", // Dossier de sortie pour la build
    sourcemap: true, // Active les sourcemaps en production
  },
  optimizeDeps: {
    include: ['tabulator-tables'], // Optimise les dépendances
  },
});