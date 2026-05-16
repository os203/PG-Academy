import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'osos@gmail.com';
  
  // Find User
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  // Find Track
  const track = await prisma.track.findFirst({
    where: {
      title: {
        contains: 'AI Marketing',
        mode: 'insensitive',
      },
    },
  });

  if (!track) {
    console.error(`Track "AI Marketing" not found.`);
    return;
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      trackId: track.id,
    },
  });

  if (existingEnrollment) {
    console.log(`User ${email} is already enrolled in ${track.title}. Updating status to APPROVED if not already.`);
    await prisma.enrollment.update({
      where: { id: existingEnrollment.id },
      data: { status: 'APPROVED' },
    });
    console.log('Done.');
    return;
  }

  // Create Enrollment
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      trackId: track.id,
      status: 'APPROVED',
    },
  });
  
  // Optionally create a fake payment record just in case
  await prisma.payment.create({
    data: {
      userId: user.id,
      trackId: track.id,
      amount: track.price,
      status: 'COMPLETED',
      type: 'COURSE_PURCHASE'
    }
  });

  console.log(`Successfully enrolled ${email} into "${track.title}"!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
