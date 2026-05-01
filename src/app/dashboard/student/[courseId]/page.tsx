import StudentCourseViewer from "@/components/StudentCourseViewer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-6xl mx-auto pt-8 px-6">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors mb-4 group"
          dir="rtl"
        >
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
          العودة إلى لوحة الطالب
        </Link>
      </div>

      <StudentCourseViewer courseId={courseId} />
    </div>
  );
}