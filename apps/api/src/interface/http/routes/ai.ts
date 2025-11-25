// apps/api/src/interface/http/routes/ai.ts
import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { auth } from "../../../infra/auth" // Ton instance Better-Auth
import { openaiAdapter } from "../../../infra/ai/openai.adapter"
import { generationAdapter } from "../../../infra/db/generation.adapter" // <--- Adapter DB
import { makeGenerateSummary } from "../../../core/use-cases/generate-summary"
import { makeListHistory } from "../../../core/use-cases/list-history"
import { makeDeleteGeneration } from "../../../core/use-cases/delete-generation"

const app = new Hono()

// --- COMPOSITION ROOT ---
// On injecte MAINTENANT les 2 dépendances : IA + DB
// --- COMPOSITION ROOT ---
const generateSummary = makeGenerateSummary(openaiAdapter, generationAdapter)
const listHistory = makeListHistory(generationAdapter)
const deleteGeneration = makeDeleteGeneration(generationAdapter)

// Schema de validation
const generateSchema = z.object({
  text: z.string().min(10, "Le texte doit contenir au moins 10 caractères"),
})

app.post("/summary", zValidator("json", generateSchema), async (c) => {
  const { text } = c.req.valid("json")

  // 1. Récupération de la session utilisateur
  // Better-Auth permet de récupérer la session depuis la requête Hono
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try {
    // 2. Exécution du Use Case (avec le userId de la session)
    const result = await generateSummary(text, session.user.id)

    return c.json({
      success: true,
      summary: result,
    })
  } catch (error: any) {
    console.error(error)
    return c.json(
      {
        success: false,
        error: error.message,
      },
      400
    )
  }
})

// --- NOUVELLE ROUTE GET ---
app.get("/history", async (c) => {
  // 1. Auth
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  // 2. Use Case
  const history = await listHistory(session.user.id)

  // 3. Response
  return c.json({ history })
})

app.delete("/history/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id") // Récupère l'ID dans l'URL

  await deleteGeneration(id, session.user.id)

  return c.json({ success: true })
})

export default app
