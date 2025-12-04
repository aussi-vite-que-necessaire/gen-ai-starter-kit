import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'api',
    globals: true, // Permet d'utiliser describe, it, expect sans import
    environment: "node",
  },
})
