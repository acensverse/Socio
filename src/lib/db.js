// Forced reload v2 to pick up new Prisma Client
import "server-only"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in environment variables")
}

const adapter = new PrismaLibSql({
    url: databaseUrl || "file:./dev.db"
})

// Force recreate client to pick up schema changes
export const prisma = new PrismaClient({
    adapter
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
