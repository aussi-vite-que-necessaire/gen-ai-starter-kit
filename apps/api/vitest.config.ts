import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true, // Permet d'utiliser describe, it, expect sans import
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    // On exclut les dossiers de build et de config
    exclude: ["**/node_modules/**", "**/dist/**", "**/drizzle/**"],
  },
})
