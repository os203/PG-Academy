import StudentTrackViewer from "@/components/StudentTrackViewer";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  return <StudentTrackViewer trackId={trackId} />;
}
