import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import SendNotificationForm from "@/app/dashboard/instructor/send-notification/SendNotificationForm";

export default async function InstructorSendNotificationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decoded = await verifyToken(token);

  if (!decoded?.userId) {
    redirect("/login");
  }

  // Verify instructor role
  const user = await db.user.findUnique({
    where: { id: decoded.userId },
    select: { role: true },
  });

  if (!user || user.role !== "INSTRUCTOR") {
    redirect("/dashboard");
  }

  // Fetch courses taught by this instructor
  const courses = await db.course.findMany({
    where: { instructorId: decoded.userId },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-2xl mx-auto w-full min-h-screen">
      <SendNotificationForm courses={courses} />
    </div>
  );
}
