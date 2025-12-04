import { Hono } from "hono"
import { eq, desc, and } from "drizzle-orm"
import { requireAuth, type AuthEnv } from "../auth.js"
import { db } from "../db.js"
import { pages } from "../db/schema.js"

const app = new Hono<AuthEnv>()

// Toutes les routes necessitent l'auth
app.use("*", requireAuth)

// --- Routes CRUD ---

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
