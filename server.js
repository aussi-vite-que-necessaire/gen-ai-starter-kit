const http = require("http")
const { drizzle } = require("drizzle-orm/node-postgres")
const { Pool } = require("pg")
const { createClient } = require("redis")
const { visitorLog } = require("./drizzle/schema")
const { count } = require("drizzle-orm")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const db = drizzle(pool)

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || "redis"}:${
    process.env.REDIS_PORT || 6379
  }`,
})
redisClient.on("error", (err) => console.error("Redis Error", err))
redisClient.connect().catch(console.error)

const server = http.createServer(async (req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "text/plain; charset=utf-8")

  try {
    await db.insert(visitorLog).values({
      message: "Hello from Drizzle!",
      name: "Visitor",
      email: "visitor@example.com",
      userAgent: req.headers["user-agent"] || "Unknown",
    })

    const result = await db.select({ value: count() }).from(visitorLog)
    const countDB = result[0].value

    let countRedis = "N/A"
    if (redisClient.isOpen) {
      countRedis = await redisClient.incr("page_views")
    }

    const msg = `
🚀 Stack Pro avec Drizzle !
------------------------------
🐘 Lignes en DB (Drizzle) : ${countDB}
⚡️ Compteur Redis        : ${countRedis}
🌍 Env                   : ${process.env.NODE_ENV}
    `
    res.end(msg)
  } catch (e) {
    console.error(e)
    res.end(`Erreur: ${e.message}`)
  }
})

const PORT = 3000
server.listen(PORT, () => console.log(`Server running on ${PORT}`))
