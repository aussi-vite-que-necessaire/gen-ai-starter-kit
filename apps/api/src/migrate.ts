import { migrate } from "drizzle-orm/node-postgres/migrator"
import { db, pool } from "./db.js"

async function main() {
  console.log("⏳ Running migrations...")

  await migrate(db, { migrationsFolder: "./drizzle" })

  console.log("✅ Migrations completed!")

  // Important : fermer la connexion sinon le script ne s'arrête jamais
  await pool.end()
}

main().catch((err) => {
  console.error("❌ Migration failed!", err)
  process.exit(1)
})
