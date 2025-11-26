import { serve } from "@hono/node-server"
import { env } from "./env"
import { db } from "./infra/db"
import { createApp } from "./app"
import { BullMQWorkflowEngine } from "./infra/adapters/bullmq-workflow"
import { loadWorkflows } from "./core/workflows/loader"
// 1. Initialiser l'Infra Async
const redisUrl = `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`
export const workflowEngine = new BullMQWorkflowEngine(redisUrl, db)

// 2. Initialiser l'App Web
const app = createApp()

// 3. Lancer le Worker (Optionnel : pourrait être dans un process séparé)
loadWorkflows()

const worker = workflowEngine.createWorker()
console.log("🚀 Workflow Worker started")

// 4. Lancer le Serveur HTTP
console.log(`🚀 Server running on port ${env.PORT}`)
serve({
  fetch: app.fetch,
  port: env.PORT,
})

// Graceful Shutdown
process.on("SIGTERM", async () => {
  await worker.close()
  process.exit(0)
})
