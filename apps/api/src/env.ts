import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

const envSchema = z.object({
  // Config Serveur
  NODE_ENV: z
    .enum(["development", "production", "test", "preview"])
    .default("development"),

  PORT: z.coerce.number().default(3000),

  // URLs
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),

  // Auth
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),

  // AI
  OPENAI_API_KEY: z.string(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 4)
  )
  process.exit(1)
}

export const env = parsedEnv.data
