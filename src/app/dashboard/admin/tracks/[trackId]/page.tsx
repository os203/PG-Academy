import InstructorTrackManager from "@/components/InstructorTrackManager";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function AdminCourseManagePage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto pt-8 px-6">
        <Link
          href="/dashboard/admin/tracks"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-primary font-medium transition-colors mb-4 group"
        >
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
          Back to Track Catalog
        </Link>
      </div>

      <InstructorTrackManager trackId={trackId} />
    </div>
  );
}
