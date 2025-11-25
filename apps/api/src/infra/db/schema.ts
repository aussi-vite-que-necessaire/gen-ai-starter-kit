import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

// On utilise 'export const' au lieu de module.exports
export const visitorLog = pgTable("VisitorLog", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  name: text("name"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})
