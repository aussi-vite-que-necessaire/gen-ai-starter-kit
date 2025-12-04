import { Queue } from "bullmq"
import { env } from "../env.js"
import { QUEUE_CONFIGS, QueueName } from "./config.js"

// Connection Redis
const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
}

// Queues BullMQ
export const queues: Record<QueueName, Queue> = {} as Record<QueueName, Queue>

Object.keys(QUEUE_CONFIGS).forEach((name) => {
  queues[name as QueueName] = new Queue(name, { connection })
})

// --- Helper pour ajouter un job ---

export interface WorkflowJobData {
  workflowId: string
  webhookPath: string
  payload: Record<string, unknown>
}

export async function addWorkflowJob(
  queueName: QueueName,
  data: WorkflowJobData
): Promise<string> {
  const job = await queues[queueName].add("process-workflow", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  })
  return job.id ?? ""
}
