import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const result = await (prisma as any).$queryRawUnsafe('PRAGMA table_info(Comment);')
    console.log('Comment table info:', JSON.stringify(result, null, 2))
    
    // Also check one comment if any
    const comments = await (prisma as any).$queryRawUnsafe('SELECT * FROM Comment LIMIT 1;')
    console.log('One comment:', JSON.stringify(comments, null, 2))
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
