import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.track.findMany();
  console.log(tracks.map(t => ({ id: t.id, title: t.title, status: t.status })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
