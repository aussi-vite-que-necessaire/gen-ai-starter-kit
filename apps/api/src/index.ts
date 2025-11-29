import { serve } from "@hono/node-server"
import { env } from "./env"
import { createApp } from "./app"
import { startWorkers } from "./workflows/worker"

// 1. Creer l'app Hono
const app = createApp()

// 2. Demarrer les workers BullMQ
startWorkers()

// 3. Lancer le serveur HTTP
console.log(`🚀 Server running on port ${env.PORT}`)
serve({
  fetch: app.fetch,
  port: env.PORT,
})
