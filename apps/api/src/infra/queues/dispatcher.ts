// apps/api/src/infra/queues/dispatcher.ts
import { Queue, Worker, Job } from "bullmq"
import axios from "axios"
import { env } from "../../env"
import { QUEUE_CONFIGS, QueueName } from "./config"

// Les données attendues dans un Job
interface N8nJobData {
  webhookPath: string // ex: "generate-video"
  payload: any // ex: { prompt: "..." }
}

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
}

// 1. Factory pour créer les Queues (pour l'API qui envoie)
export const queues: Record<string, Queue> = {}

Object.keys(QUEUE_CONFIGS).forEach((name) => {
  queues[name] = new Queue(name, { connection })
})

// 2. Factory pour créer les Workers (pour le processeur qui exécute)
export const startWorkers = () => {
  Object.entries(QUEUE_CONFIGS).forEach(([name, config]) => {
    new Worker<N8nJobData>(
      name,
      async (job) => {
        const { webhookPath, payload } = job.data
        console.log(`[Queue: ${name}] Sending to n8n: ${webhookPath}`)

        // L'appel au n8n interne (via le réseau Docker ou localhost)
        // En local depuis le PC: localhost:5678
        // En prod (container à container): http://n8n:5678
        // Pour simplifier le dev local, on utilise env.N8N_URL

        try {
          await axios.post(`${env.N8N_URL}/webhook/${webhookPath}`, payload, {
            headers: { "x-internal-secret": env.INTERNAL_API_SECRET },
          })
        } catch (error: any) {
          console.error(`Error calling n8n: ${error.message}`)
          throw error // BullMQ réessaiera plus tard
        }
      },
      {
        connection,
        concurrency: config.concurrency, // <--- Applique le quota ici
        limiter: config.limiter,
      }
    )

    console.log(
      `✅ Worker started for queue: ${name} (Concurrency: ${config.concurrency})`
    )
  })
}
