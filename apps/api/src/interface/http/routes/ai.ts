// apps/api/src/interface/http/routes/ai.ts
import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { openaiAdapter } from "../../../infra/ai/openai.adapter"
import { makeGenerateSummary } from "../../../core/use-cases/generate-summary"

const app = new Hono()

// --- COMPOSITION ROOT (Injection de dépendance) ---
// On crée l'instance du use-case en lui donnant le vrai adapter
const generateSummary = makeGenerateSummary(openaiAdapter)

// --- SCHEMA DE VALIDATION INPUT (HTTP Layer) ---
const generateSchema = z.object({
  text: z.string().min(10, "Le texte doit contenir au moins 10 caractères"),
})

// --- ROUTE ---
app.post("/summary", zValidator("json", generateSchema), async (c) => {
  // 1. Récupération des données validées
  const { text } = c.req.valid("json")

  try {
    // 2. Exécution du Use Case
    const result = await generateSummary(text)

    // 3. Réponse
    return c.json({
      success: true,
      summary: result,
    })
  } catch (error: any) {
    // Gestion d'erreur basique (à améliorer avec un middleware global)
    return c.json(
      {
        success: false,
        error: error.message,
      },
      400
    )
  }
})

export default app
