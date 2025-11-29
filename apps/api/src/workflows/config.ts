import type { WorkflowType } from "@genai/shared/workflows"

// =============================================================================
// QUEUE CONFIGURATION
// QueueName = tous les workflow types + "default"
// =============================================================================

export type QueueName = WorkflowType | "default"

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
