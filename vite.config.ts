import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [
    react(),
  ],
  server: {
    port: 5002,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo as { name?: string };
          if (info.name?.endsWith('.ttf') || info.name?.endsWith('.woff')) {
            return 'fonts/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
