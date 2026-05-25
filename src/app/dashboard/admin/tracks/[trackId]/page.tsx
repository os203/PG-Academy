"use client";

import InstructorTrackManager from "@/components/InstructorTrackManager";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { use } from "react";

export default function AdminCourseManagePage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = use(params);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto pt-8 px-6">
        <Link
          href="/dashboard/admin/tracks"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-primary font-medium transition-colors mb-4 group"
        >
          <ArrowRight
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("admin.tracks.backToCatalog")}
        </Link>
      </div>

      <InstructorTrackManager trackId={trackId} />
    </div>
  );
}
