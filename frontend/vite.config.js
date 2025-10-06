import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    // ✅ CACHE BUSTING - Force new file names on every build
    rollupOptions: {
      output: {
        entryFileNames: `[name]-[hash].js`,
        chunkFileNames: `[name]-[hash].js`,
        assetFileNames: `[name]-[hash].[ext]`,
      },
    },
  },
  server: {
    port: 3000,
  },
  // ✅ DEFINE BACKEND URL FOR FRONTEND
  define: {
    "import.meta.env.VITE_BACKEND_URL": JSON.stringify(
      "https://fintemple-backend.onrender.com"
    ),
  },
  // ✅ ADD THIS FOR SPA ROUTING FIX
  base: "./",
});
