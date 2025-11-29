// Configuration des queues BullMQ

export type QueueName = "default" | "page-generation"

export interface QueueConfig {
  concurrency: number
  limiter?: {
    max: number
    duration: number
  }
}

export const QUEUE_CONFIGS: Record<QueueName, QueueConfig> = {
  default: {
    concurrency: 50,
  },
  "page-generation": {
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 60000,
    },
  },
}
