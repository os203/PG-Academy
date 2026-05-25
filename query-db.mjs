import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, email: true }
  });
  console.log('STUDENTS:', JSON.stringify(users, null, 2));
  
  const tracks = await db.track.findMany({
    select: { id: true, title: true, status: true }
  });
  console.log('TRACKS:', JSON.stringify(tracks, null, 2));

  const enrollments = await db.enrollment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      track: { select: { title: true } }
    }
  });
  console.log('ENROLLMENTS:', JSON.stringify(enrollments, null, 2));

  await db.$disconnect();
}

main().catch(console.error);
