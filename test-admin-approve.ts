import { PrismaClient } from '@prisma/client';
import { SignJWT } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_key_DO_NOT_USE_IN_PROD"
);

async function main() {
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    console.log("No admin found");
    return;
  }
  
  const token = await new SignJWT({ userId: adminUser.id, email: adminUser.email, role: adminUser.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);

  const courses = await prisma.course.findMany();
  if (courses.length > 0) {
    const courseId = courses[0].id;
    const res = await fetch(`http://localhost:3000/api/admin/courses/${courseId}/approve`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": `token=${token}`
      },
      body: JSON.stringify({ status: courses[0].status === "DRAFT" ? "PUBLISHED" : "DRAFT" })
    });
    console.log("Status code:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  }
}
main();
