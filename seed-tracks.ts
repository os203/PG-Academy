import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find or create an instructor
  let instructor = await prisma.user.findFirst({
    where: { role: 'INSTRUCTOR' }
  });

  if (!instructor) {
    instructor = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
  }

  if (!instructor) {
    instructor = await prisma.user.create({
      data: {
        name: 'PG Academy Instructor',
        email: 'instructor@pgacademy.com',
        password: '$2b$10$abcdefghijklmnopqrstuv', // Dummy hash
        role: 'INSTRUCTOR',
      }
    });
  }

  console.log(`Using instructor ID: ${instructor.id}`);

  // Ensure category exists
  let category = await prisma.category.findFirst({
    where: { name: 'AI Creativity' }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'AI Creativity',
        slug: 'ai-creativity'
      }
    });
  }

  const tracksToCreate = [
    {
      title: "AI Animation",
      subtitle: "Motion Design for the AI Era",
      description: "Master AI-powered animation pipelines and produce broadcast-quality content from concept to final render.",
      thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
      status: "PUBLISHED",
      price: 299,
    },
    {
      title: "AI Filmmaking",
      subtitle: "Cinematic Storytelling for the AI Era",
      description: "Create cinematic stories using AI tools across scriptwriting, production, VFX, and post-production.",
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop",
      status: "PUBLISHED",
      price: 349,
    },
    {
      title: "AI Games",
      subtitle: "Game Worlds for the AI Era",
      description: "Design and develop interactive gaming experiences powered by artificial intelligence and creative vision.",
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      status: "PUBLISHED",
      price: 399,
    },
    {
      title: "AI Marketing",
      subtitle: "Performance Marketing for the AI Era",
      description: "Build high-impact campaigns using AI content generation, data storytelling, and next-gen digital strategy.",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
      status: "PUBLISHED",
      price: 199,
    }
  ];

  for (const trackData of tracksToCreate) {
    const existingTrack = await prisma.track.findFirst({
      where: { title: trackData.title }
    });

    if (!existingTrack) {
      await prisma.track.create({
        data: {
          ...trackData,
          status: "PUBLISHED", // Cast as TrackStatus automatically
          instructorId: instructor.id,
          categoryId: category.id,
        }
      });
      console.log(`Created track: ${trackData.title}`);
    } else {
      console.log(`Track already exists: ${trackData.title}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
