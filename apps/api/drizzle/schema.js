const { pgTable, serial, text, timestamp } = require("drizzle-orm/pg-core")

const visitorLog = pgTable("VisitorLog", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  name: text("name"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})

module.exports = { visitorLog }
