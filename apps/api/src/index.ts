import { serve } from "@hono/node-server"
import { env } from "./env"
import { db } from "./infra/db"
import { createApp } from "./app"

// 1. Initialiser l'Infra Async
const redisUrl = `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`

// 2. Initialiser l'App Web
const app = createApp()

console.log("🚀 Workflow Worker started")

// 4. Lancer le Serveur HTTP
console.log(`🚀 Server running on port ${env.PORT}`)
serve({
  fetch: app.fetch,
  port: env.PORT,
})

// // Graceful Shutdown
// process.on("SIGTERM", async () => {
//   await worker.close()
//   process.exit(0)
// })
