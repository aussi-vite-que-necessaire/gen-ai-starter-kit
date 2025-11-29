import { Worker } from "bullmq"
import { eq } from "drizzle-orm"
import { env } from "../env"
import { db } from "../db"
import { workflows } from "../db/schema"
import { QUEUE_CONFIGS } from "./config"
import { WorkflowJobData } from "./queues"

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
}

// Config polling
const POLL_INTERVAL_MS = 2000 // 2 secondes
const POLL_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

// Helper pour attendre
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function startWorkers() {
  Object.entries(QUEUE_CONFIGS).forEach(([name, config]) => {
    const worker = new Worker<WorkflowJobData>(
      name,
      async (job) => {
        const { workflowId, webhookPath, payload } = job.data
        console.log(
          `[Worker: ${name}] Processing workflow ${workflowId} -> ${webhookPath}`
        )

        // 1. Update status RUNNING
        await db
          .update(workflows)
          .set({ status: "RUNNING", updatedAt: new Date() })
          .where(eq(workflows.id, workflowId))

        // 2. Trigger n8n webhook
        try {
          const response = await fetch(
            `${env.N8N_URL}/webhook/${webhookPath}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-secret": env.INTERNAL_API_SECRET,
              },
              body: JSON.stringify({
                workflowId,
                payload,
              }),
            }
          )

          if (!response.ok) {
            throw new Error(`n8n webhook error: ${response.status}`)
          }

          console.log(
            `[Worker: ${name}] Triggered n8n for workflow ${workflowId}`
          )
        } catch (error: any) {
          // Si le trigger échoue, mark FAILED et throw pour retry BullMQ
          await db
            .update(workflows)
            .set({
              status: "FAILED",
              error: error.message,
              updatedAt: new Date(),
            })
            .where(eq(workflows.id, workflowId))

          throw error
        }

        // 3. Poll DB jusqu'à completion
        const startTime = Date.now()

        while (Date.now() - startTime < POLL_TIMEOUT_MS) {
          await sleep(POLL_INTERVAL_MS)

          const [workflow] = await db
            .select({ status: workflows.status, error: workflows.error })
            .from(workflows)
            .where(eq(workflows.id, workflowId))

          if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`)
          }

          if (workflow.status === "COMPLETED") {
            console.log(`[Worker: ${name}] Workflow ${workflowId} completed`)
            return { success: true, workflowId }
          }

          if (workflow.status === "FAILED") {
            console.log(
              `[Worker: ${name}] Workflow ${workflowId} failed: ${workflow.error}`
            )
            throw new Error(workflow.error || "Workflow failed")
          }

          // Still RUNNING, continue polling
        }

        // 4. Timeout
        await db
          .update(workflows)
          .set({
            status: "FAILED",
            error: "Workflow timeout (30 minutes)",
            updatedAt: new Date(),
          })
          .where(eq(workflows.id, workflowId))

        throw new Error("Workflow timeout")
      },
      {
        connection,
        concurrency: config.concurrency,
        limiter: config.limiter,
      }
    )

    worker.on("completed", (job) => {
      console.log(`[Worker: ${name}] Job ${job.id} completed`)
    })

    worker.on("failed", (job, err) => {
      console.error(`[Worker: ${name}] Job ${job?.id} failed: ${err.message}`)
    })

    console.log(
      `✅ Worker started: ${name} (concurrency: ${config.concurrency})`
    )
  })
}
