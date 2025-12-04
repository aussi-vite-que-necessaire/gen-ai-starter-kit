import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { eq } from "drizzle-orm"
import { db } from "../db.js"
import { workflows } from "../db/schema.js"
import { env } from "../env.js"
import {
  handlers,
  isValidWorkflowType,
  markWorkflowCompleted,
  markWorkflowFailed,
} from "../workflows.js"

const app = new Hono()

// Middleware securite (appelé par n8n)
app.use("*", async (c, next) => {
  const secret = c.req.header("x-internal-secret")
  if (secret !== env.INTERNAL_API_SECRET) {
    return c.json({ error: "Unauthorized" }, 403)
  }
  await next()
})

// --- SCHEMAS ---

const updateStatusSchema = z.object({
  workflowId: z.string().uuid(),
  displayMessage: z.string(),
})

const completeSchema = z.object({
  workflowId: z.string().uuid(),
  result: z.record(z.unknown()),
})

const failSchema = z.object({
  workflowId: z.string().uuid(),
  error: z.string(),
})

// --- ROUTES ---

// POST /api/n8n/update-status - Met a jour le displayMessage
app.post(
  "/update-status",
  zValidator("json", updateStatusSchema),
  async (c) => {
    const { workflowId, displayMessage } = c.req.valid("json")

    console.log(`[n8n] Update status ${workflowId}: ${displayMessage}`)

    await db
      .update(workflows)
      .set({
        displayMessage,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, workflowId))

    return c.json({ success: true })
  }
)

// POST /api/n8n/:type/complete - Complete un workflow
app.post("/:type/complete", zValidator("json", completeSchema), async (c) => {
  const type = c.req.param("type")
  const { workflowId, result } = c.req.valid("json")

  console.log(`[n8n] Complete ${type} workflow ${workflowId}`)

  if (!isValidWorkflowType(type)) {
    return c.json({ error: `Unknown workflow type: ${type}` }, 404)
  }

  const handler = handlers[type]

  // Récupère le workflow
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, workflowId))

  if (!workflow) {
    return c.json({ error: "Workflow not found", workflowId }, 404)
  }

  // Valide le payload et le result
  const payload = handler.payload.parse(workflow.payload)
  const validResult = handler.result.parse(result)

  // Sauvegarde dans les tables métier
  const saveResponse = await handler.saveResult(payload, validResult)

  // Mark completed avec result complet
  await markWorkflowCompleted(workflowId, {
    ...validResult,
    ...saveResponse,
  })

  return c.json({ success: true, ...saveResponse })
})

// POST /api/n8n/fail - Marque un workflow comme failed
app.post("/fail", zValidator("json", failSchema), async (c) => {
  const { workflowId, error } = c.req.valid("json")

  console.log(`[n8n] Failed ${workflowId}: ${error}`)

  await markWorkflowFailed(workflowId, error)

  return c.json({ success: true })
})

export default app
