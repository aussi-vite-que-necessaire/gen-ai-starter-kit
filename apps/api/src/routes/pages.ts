import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { eq, desc, and } from "drizzle-orm"
import { auth, requireAuth } from "../auth"
import { db } from "../db"
import { pages, workflows } from "../db/schema"
import { addWorkflowJob } from "../workflows/queues"
import { WorkflowDefinitions } from "../workflows/definitions"

// Type pour le contexte Hono avec user
type Env = {
  Variables: {
    user: typeof auth.$Infer.Session.user
    session: typeof auth.$Infer.Session.session
  }
}

const app = new Hono<Env>()

// Toutes les routes necessitent l'auth
app.use("*", requireAuth)

// --- Schemas de validation ---

const generatePageSchema = z.object({
  prompt: z.string().optional(),
})

// --- Routes ---

// GET /api/pages - Liste les pages de l'utilisateur
app.get("/", async (c) => {
  const userId = c.var.user.id

  const userPages = await db
    .select()
    .from(pages)
    .where(eq(pages.userId, userId))
    .orderBy(desc(pages.createdAt))

  return c.json({ pages: userPages })
})

// GET /api/pages/:id - Detail d'une page
app.get("/:id", async (c) => {
  const userId = c.var.user.id
  const pageId = c.req.param("id")

  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.userId, userId)))

  if (!page) {
    return c.json({ error: "Page not found" }, 404)
  }

  return c.json({ page })
})

// POST /api/pages/generate - Lance un workflow de génération
app.post("/generate", zValidator("json", generatePageSchema), async (c) => {
  const userId = c.var.user.id
  const { prompt } = c.req.valid("json")

  const workflowDef = WorkflowDefinitions["page-generation"]

  // Payload pour n8n (pas de pageId, la page sera créée à la fin)
  const payload = { userId, prompt }

  // Crée le workflow
  const [workflow] = await db
    .insert(workflows)
    .values({
      webhookPath: workflowDef.webhookPath,
      payload,
      status: "PENDING",
      displayMessage: "En attente...",
    })
    .returning()

  // Ajoute un job BullMQ
  const jobId = await addWorkflowJob("page-generation", {
    workflowId: workflow.id,
    webhookPath: workflowDef.webhookPath,
    payload,
  })

  console.log(`[Pages] Started workflow ${workflow.id}, job ${jobId}`)

  return c.json(
    {
      success: true,
      workflowId: workflow.id,
      jobId,
    },
    201
  )
})

// DELETE /api/pages/:id - Supprime une page
app.delete("/:id", async (c) => {
  const userId = c.var.user.id
  const pageId = c.req.param("id")

  const result = await db
    .delete(pages)
    .where(and(eq(pages.id, pageId), eq(pages.userId, userId)))
    .returning()

  if (result.length === 0) {
    return c.json({ error: "Page not found" }, 404)
  }

  return c.json({ success: true })
})

export default app
