import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "./env"
import { auth } from "./auth"
import pagesRouter from "./routes/pages"
import workflowsRouter from "./routes/workflows"

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

  // Routes Metier
  app.route("/api/pages", pagesRouter)

  // Routes Workflows (status + complete)
  app.route("/api/workflows", workflowsRouter)

  return app
}
