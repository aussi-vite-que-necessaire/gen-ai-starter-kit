import { serve } from "@hono/node-server"
import { env } from "./env.js"
import { createApp } from "./app.js"
import { startWorkers } from "./workflows/worker.js"

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
