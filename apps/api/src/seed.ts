/**
 * Seed script - Crée un utilisateur de test pour les environnements de dev/preview
 *
 * Usage: npm run db:seed -w api
 */

import { db } from "./db.js"
import { user, account } from "./db/schema.js"
import { eq } from "drizzle-orm"
import { scrypt, randomBytes } from "crypto"
import { promisify } from "util"

const scryptAsync = promisify(scrypt)

const TEST_USER = {
  email: "sys@avqn.ch",
  password: "Automation123",
  name: "Test User",
}

async function hashPassword(password: string): Promise<string> {
  // Better-Auth utilise scrypt avec ce format
  const salt = randomBytes(16).toString("hex")
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${derivedKey.toString("hex")}.${salt}`
}

async function seed() {
  console.log("🌱 Seeding database...")

  // Vérifie si l'utilisateur existe déjà
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, TEST_USER.email))
    .limit(1)

  if (existingUser.length > 0) {
    console.log(`✅ User ${TEST_USER.email} already exists, skipping...`)
    return
  }

  const userId = crypto.randomUUID()
  const now = new Date()

  // Créer l'utilisateur
  await db.insert(user).values({
    id: userId,
    email: TEST_USER.email,
    name: TEST_USER.name,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })

  // Créer le compte (credential = email/password)
  const hashedPassword = await hashPassword(TEST_USER.password)
  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  })

  console.log(`✅ Created test user:`)
  console.log(`   Email: ${TEST_USER.email}`)
  console.log(`   Password: ${TEST_USER.password}`)
}

seed()
  .then(() => {
    console.log("🌱 Seed completed!")
    process.exit(0)
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err)
    process.exit(1)
  })
