import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({ select: { id: true, title: true, status: true } });
  console.log("Courses:", courses);
  if (courses.length > 0) {
    const courseId = courses[0].id;
    const res = await fetch(`http://localhost:3000/api/admin/courses/${courseId}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" })
    });
    console.log("Status code:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  }
}
main();
