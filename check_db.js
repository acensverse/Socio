import { prisma } from './src/lib/db'; async function main() { const count = await prisma.post.count({ where: { mediaType: 'video' } }); console.log('Video count:', count); } main();
