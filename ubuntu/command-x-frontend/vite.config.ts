import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/api/projects": {
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      },
      "/api/workorders": {
        target: "http://localhost:3003",
        changeOrigin: true,
        secure: false,
      },
      "/api/users": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild", // Changed from terser to esbuild
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@tanstack/react-query", "lucide-react"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["jwt-decode"],
  },
});
