import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "./env"
import { auth } from "./infra/auth"
import aiRouter from "./interface/http/routes/ai"
import internalRouter from "./interface/http/routes/internal"

export const createApp = () => {
  const app = new Hono()

  // Middlewares Globaux
  app.use("*", logger())
  app.use(
    "*",
    cors({
      origin: env.FRONTEND_URL,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )

  // Routes Auth (Better-Auth)
  app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))

  // Routes Métier
  app.route("/api/ai", aiRouter)

  // Routes Internal (n8n)
  app.route("/api/internal", internalRouter)

  return app
}
