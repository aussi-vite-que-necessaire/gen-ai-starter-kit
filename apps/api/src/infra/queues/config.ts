// apps/api/src/infra/queues/config.ts

export type QueueName = "default" | "media-generation"

interface QueueConfig {
  concurrency: number // Combien de jobs en parallèle ?
  limiter?: {
    // Optionnel: Rate Limiting global
    max: number
    duration: number
  }
}

export const QUEUE_CONFIGS: Record<QueueName, QueueConfig> = {
  default: {
    concurrency: 50, // Rapide (GPT, Slack, etc.)
  },
  "media-generation": {
    concurrency: 3, // <--- LA SÉCURITÉ HEYGEN
    limiter: {
      max: 10, // Max 10 par minute
      duration: 60000,
    },
  },
}
