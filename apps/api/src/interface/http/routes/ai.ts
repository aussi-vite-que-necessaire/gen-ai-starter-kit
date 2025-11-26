import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { requireAuth } from "../middlewares/auth.middleware" // Import du middleware
import { useCases } from "../../../container" // Import du container

// On type l'application pour qu'elle connaisse "c.var.user"
const app = new Hono<{ Variables: { user: any } }>()

// Tous les endpoints ci-dessous nécessitent l'auth
app.use("*", requireAuth)

const generateSchema = z.object({
  text: z.string().min(10, "Min 10 chars"),
})

app.post("/summary", zValidator("json", generateSchema), async (c) => {
  const { text } = c.req.valid("json")
  const user = c.var.user // Dispo grâce au middleware !

  try {
    const result = await useCases.generateSummary(text, user.id)
    return c.json({ success: true, summary: result })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400)
  }
})

app.get("/history", async (c) => {
  const history = await useCases.listHistory(c.var.user.id)
  return c.json({ history })
})

app.delete("/history/:id", async (c) => {
  const id = c.req.param("id")
  await useCases.deleteGeneration(id, c.var.user.id)
  return c.json({ success: true })
})

export default app
