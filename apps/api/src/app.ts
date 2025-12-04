import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { env } from "./env.js"
import { auth } from "./auth.js"
import pagesRouter from "./routes/pages.js"
import workflowsRouter from "./routes/workflows.js"
import n8nRouter from "./routes/n8n.js"

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
  app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

  // Routes API (frontend)
  app.route("/api/pages", pagesRouter)
  app.route("/api/workflows", workflowsRouter)

  // Routes n8n (callbacks)
  app.route("/api/n8n", n8nRouter)

  // Global Error Handler
  app.onError((err, c) => {
    console.error(err)
    return c.json(
      {
        success: false,
        error: err.message || "Internal Server Error",
      },
      500
    )
  })

  return app
}
