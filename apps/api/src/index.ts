import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "./env"

const app = new Hono()

// Middlewares
app.use("*", logger())
app.use(
  "*",
  cors({
    origin: env.FRONTEND_URL, // Sécurité CORS basée sur l'env
    credentials: true,
  })
)

// Health Check (pour Docker/Traefik)
app.get("/health", (c) => c.json({ status: "ok", env: env.NODE_ENV }))

// API Routes (exemple)
app.get("/", (c) => {
  return c.json({ message: "Hello from Hexagonal Hono API!" })
})

console.log(`🚀 Server is running on port ${env.PORT}`)

serve({
  fetch: app.fetch,
  port: env.PORT,
})
