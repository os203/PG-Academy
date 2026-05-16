/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Development", slug: "development" },
    { name: "Design", slug: "design" },
    { name: "Business", slug: "business" },
    { name: "Marketing", slug: "marketing" },
    { name: "IT & Software", slug: "it-software" },
    { name: "Data Science", slug: "data-science" },
    { name: "3D", slug: "3d" },
    { name: "2D", slug: "2d" },
    { name: "VFX", slug: "vfx" },
    { name: "Others", slug: "others" },
  ];

  for (const c of categories) {
    const exists = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (!exists) {
      await prisma.category.create({ data: c });
      console.log(`Created category: ${c.name}`);
    } else {
      console.log(`Category exists: ${c.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
