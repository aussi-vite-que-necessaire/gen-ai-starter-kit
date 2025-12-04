import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'api',
    globals: true, // Permet d'utiliser describe, it, expect sans import
    environment: "node",
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost:5432/test',
      REDIS_HOST: 'localhost',
      BETTER_AUTH_SECRET: 'test',
      BETTER_AUTH_URL: 'http://localhost:3000',
      FRONTEND_URL: 'http://localhost:5173',
      N8N_URL: 'http://localhost:5678',
      INTERNAL_API_SECRET: 'test',
    },
  },
})
