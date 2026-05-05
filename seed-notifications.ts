import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  });

  if (!student) {
    console.log('No student user found');
    return;
  }

  console.log(`Creating detailed notifications for student: ${student.email}`);

  // Clear existing notifications for this student to avoid duplicates
  await prisma.notification.deleteMany({
    where: { userId: student.id }
  });

  const notifications = [
    {
      userId: student.id,
      message: 'Welcome to PG Academy! Start exploring your new dashboard.',
      type: 'welcome',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 mins ago
    },
    {
      userId: student.id,
      message: 'You have successfully enrolled in "Advanced React Patterns".',
      type: 'enrollment',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      userId: student.id,
      message: 'Instructor Sarah added a new module to your course.',
      type: 'course_update',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      userId: student.id,
      message: 'Scheduled maintenance this weekend. The platform might be slow.',
      type: 'alert',
      isRead: false,
      createdAt: new Date() // just now
    },
    {
      userId: student.id,
      message: 'Your certificate for "Next.js Mastery" is ready to download.',
      type: 'info',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
    }
  ];

  for (const notif of notifications) {
    await prisma.notification.create({
      data: notif
    });
  }

  console.log('Detailed notifications seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
