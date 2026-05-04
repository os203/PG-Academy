import StudentCourseViewer from "@/components/StudentCourseViewer";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return <StudentCourseViewer courseId={courseId} />;
}
