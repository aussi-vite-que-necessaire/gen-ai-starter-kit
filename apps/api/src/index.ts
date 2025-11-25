import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "./env"
import { auth } from "./infra/auth" // Import de l'auth

const app = new Hono()

// 1. CORS : Très important pour l'Auth (cookies)
app.use(
  "*",
  cors({
    origin: env.FRONTEND_URL,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true, // OBLIGATOIRE pour que les cookies passent
  })
)

app.use("*", logger())

// 2. Montage des routes Auth
// Hono intercepte toutes les requêtes qui commencent par /api/auth/*
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw)
})

// ... Le reste de tes routes (health, etc.)

serve({
  fetch: app.fetch,
  port: env.PORT,
})
