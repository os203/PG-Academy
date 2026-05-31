import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import SendNotificationForm from "@/app/dashboard/instructor/send-notification/SendNotificationForm";

export default async function InstructorSendNotificationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify instructor role
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "INSTRUCTOR") {
    redirect("/dashboard");
  }

  // Fetch tracks taught by this instructor
  const tracks = await db.track.findMany({
    where: { instructorId: userId },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-2xl mx-auto w-full min-h-screen">
      <SendNotificationForm tracks={tracks} />
    </div>
  );
}
