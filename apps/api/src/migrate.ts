import { migrate } from "drizzle-orm/node-postgres/migrator"
import { db } from "./infra/db" // Ton instance DB
import { pool } from "./infra/db" // On a besoin du pool pour fermer la connexion à la fin

async function main() {
  console.log("⏳ Running migrations...")

  await migrate(db, { migrationsFolder: "./drizzle" })

  console.log("✅ Migrations completed!")

  // Important : fermer la connexion sinon le script ne s'arrête jamais
  // et GitHub Actions va timeout
  await pool.end()
}

main().catch((err) => {
  console.error("❌ Migration failed!", err)
  process.exit(1)
})
