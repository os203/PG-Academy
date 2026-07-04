"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  Lock,
  PlayCircle,
  Medal,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import StudentQuizPanel from "@/components/StudentQuizPanel";
import StudentQAPanel from "@/components/StudentQAPanel";
import SecureHlsPlayer from "@/components/SecureHlsPlayer";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface StudentLesson {
  id: string;
  title: string;
  notes: string | null;
  videoPath: string | null;
  order: number;
  watchedPercent: number;
  lastPosition: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  quizId: string | null;
  hasQuiz: boolean;
  quizPassed: boolean;
  attemptCount: number;
  latestScore: number | null;
  resources: Array<{ id: string; name: string; url: string }>;
}

interface StudentModule {
  id: string;
  title: string;
  order: number;
  lessons: StudentLesson[];
}

interface StudentPhase {
  id: string;
  title: string;
  order: number;
  modules: StudentModule[];
}

interface StudentTrackResponse {
  id?: string;
  title?: string;
  description?: string;
  overallProgress?: number;
  phases?: StudentPhase[];
  error?: string;
}

export default function StudentTrackViewer({ trackId }: { trackId: string }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [track, setTrack] = useState<{
    id: string;
    title: string;
    description: string;
    overallProgress: number;
    phases: StudentPhase[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [watchedPercentDraft, setWatchedPercentDraft] = useState<number>(0);
  const [lastPositionDraft, setLastPositionDraft] = useState<number>(0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [claimingCert, setClaimingCert] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"curriculum" | "lesson">(
    "curriculum"
  );



  const fetchTrack = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch(`/api/student/tracks/${trackId}`, {
        cache: "no-store",
      });

      const data = (await res.json()) as StudentTrackResponse;

      if (!res.ok || !data || data.error) {
        console.error(data?.error || "Failed to fetch student track");
        setTrack(null);
        return;
      }

      const normalizedPhases = Array.isArray(data.phases) ? data.phases : [];

      const normalizedTrack = {
        id: data.id ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        overallProgress:
          typeof data.overallProgress === "number" ? data.overallProgress : 0,
        phases: normalizedPhases,
      };

      setTrack(normalizedTrack);

      const allLessons = normalizedTrack.phases.flatMap((phase) =>
        phase.modules.flatMap((mod) => mod.lessons)
      );

      if (allLessons.length === 0) {
        setSelectedLessonId(null);
        return;
      }

      const stillExists = allLessons.some(
        (lesson) => lesson.id === selectedLessonId
      );

      let lessonToSelect = selectedLessonId;

      if (!stillExists) {
        const firstUnlockedLesson =
          allLessons.find(
            (lesson) => lesson.isUnlocked && !lesson.isCompleted
          ) ||
          allLessons.find((lesson) => lesson.isUnlocked) ||
          allLessons[0];

        lessonToSelect = firstUnlockedLesson.id;
        setSelectedLessonId(firstUnlockedLesson.id);
      }

      const activePhase = normalizedTrack.phases.find((phase) =>
        phase.modules.some((mod) =>
          mod.lessons.some((lesson) => lesson.id === lessonToSelect)
        )
      );

      if (activePhase) {
        setExpandedPhases((prev) =>
          prev.includes(activePhase.id) ? prev : [...prev, activePhase.id]
        );
      }
    } catch (error) {
      console.error(error);
      setTrack(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isPaymentReturn = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("payment_success");

    if (isPaymentReturn) {
      // After payment, the webhook may not have fired yet. Retry a few times.
      let retries = 0;
      const maxRetries = 5;
      const retryDelay = 2000;


      const attemptFetch = async () => {
        setLoading(true);
        for (retries = 0; retries <= maxRetries; retries++) {
          const res = await fetch(`/api/student/tracks/${trackId}`, { cache: "no-store" });
          if (res.ok) {
            // Success! Do a proper fetchTrack to populate state
            await fetchTrack();
            return;
          }
          if (retries < maxRetries) {
            await new Promise((r) => setTimeout(r, retryDelay));
          }
        }
        // All retries exhausted, do a final fetchTrack to set the error state
        await fetchTrack();
      };

      void attemptFetch();
    } else {
      void fetchTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  const selectedLesson = useMemo(() => {
    if (!track || !selectedLessonId) return null;

    return (
      track.phases
        .flatMap((phase) => phase.modules.flatMap((mod) => mod.lessons))
        .find((lesson) => lesson.id === selectedLessonId) || null
    );
  }, [track, selectedLessonId]);

  const watchedPercentRef = React.useRef(0);
  const lastPositionRef = React.useRef(0);

  useEffect(() => {
    watchedPercentRef.current = watchedPercentDraft;
    lastPositionRef.current = lastPositionDraft;
  }, [watchedPercentDraft, lastPositionDraft]);

  // We now trigger saves manually (on pause, end, or unmount) instead of an aggressive interval
  // to prevent any potential stream interruptions during playback.
  const saveProgressNow = useCallback(async () => {
    if (!selectedLesson) return;
    
    const currentPercent = watchedPercentRef.current;
    const currentPos = lastPositionRef.current;

    // Only save if progress actually changed
    if (currentPercent > 0 || currentPos > 0) {
      setSavingProgress(true);
      try {
        await fetch("/api/student/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: selectedLesson.id,
            watchedPercent: currentPercent,
            lastPosition: currentPos,
          }),
        });
      } catch (error) {
        console.error(error);
      } finally {
        setSavingProgress(false);
      }
    }
  }, [selectedLesson]);

  // Save progress on unmount or lesson change
  useEffect(() => {
    return () => {
      if (!selectedLesson) return;
      const currentPercent = watchedPercentRef.current;
      const currentPos = lastPositionRef.current;
      
      if (currentPercent > 0 || currentPos > 0) {
        fetch("/api/student/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json", "keepalive": "true" },
          body: JSON.stringify({
            lessonId: selectedLesson.id,
            watchedPercent: currentPercent,
            lastPosition: currentPos,
          }),
        }).catch(console.error);
      }
    };
  }, [selectedLesson]);

  useEffect(() => {
    if (!selectedLesson) return;

    setWatchedPercentDraft(selectedLesson.watchedPercent);
    setLastPositionDraft(selectedLesson.lastPosition);

    // Sync refs to display state every 2 seconds (not on every frame)
    const displaySync = setInterval(() => {
      setWatchedPercentDraft(watchedPercentRef.current);
      setLastPositionDraft(lastPositionRef.current);
    }, 2000);

    return () => clearInterval(displaySync);
  }, [selectedLesson]);

  const currentLessonInfo = useMemo(() => {
    if (!track || !selectedLessonId) return null;

    for (const phase of track.phases) {
      for (const mod of phase.modules) {
        const lesson = mod.lessons.find((item) => item.id === selectedLessonId);

        if (lesson) {
          return {
            phase: phase.title,
            module: mod.title,
            lesson: lesson.title,
          };
        }
      }
    }

    return null;
  }, [track, selectedLessonId]);



  const claimCertificate = async (): Promise<void> => {
    if (!track) return;

    setClaimingCert(true);

    try {
      const res = await fetch(`/api/student/tracks/${trackId}/certificate`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || data || "Failed to claim certificate.");
        return;
      }

      if (data?.uniqueCode) {
        window.location.href = `/certificates/${data.uniqueCode}`;
      }
    } catch (error) {
      console.error("Error claiming certificate:", error);
      alert("Error generating certificate.");
    } finally {
      setClaimingCert(false);
    }
  };

  const markLessonComplete = async (): Promise<void> => {
    if (!selectedLesson) return;

    setMarkingComplete(true);

    try {
      const res = await fetch("/api/student/progress/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: selectedLesson.id,
        }),
      });

      if (res.ok) {
        await fetchTrack();
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      let errorMessage = "Failed to mark lesson as complete.";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        errorMessage = data?.error || errorMessage;
      } else {
        const text = await res.text();
        console.error("[MARK_COMPLETE_NON_JSON_RESPONSE]", text);
      }

      alert(errorMessage);
    } catch (error) {
      console.error(error);
      alert("An error occurred while marking the lesson as complete.");
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-[#E5C158]" size={40} />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-red-500 font-bold text-lg">
          This track is not accessible or you are not enrolled.
        </div>
      </div>
    );
  }

  if (activeView === "lesson" && selectedLesson) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <button
            type="button"
            onClick={() => setActiveView("curriculum")}
            className="text-[#E5C158] hover:text-[#f1d06e] font-medium flex items-center gap-2 transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to Curriculum
          </button>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black">{selectedLesson.title}</h2>

            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#E5C158]/10 text-[#E5C158] font-bold">
                {selectedLesson.watchedPercent}% watched
              </span>

              {selectedLesson.isCompleted ? (
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  {t("student.trackViewer.completed")}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground font-bold inline-flex items-center gap-1">
                  <CircleDashed size={14} />
                  {t("student.trackViewer.inProgress")}
                </span>
              )}

              {selectedLesson.hasQuiz && (
                <span
                  className={`px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 ${
                    selectedLesson.quizPassed
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {selectedLesson.quizPassed ? (
                    <>
                      <CheckCircle2 size={13} /> {t("student.trackViewer.quizPassed")}
                    </>
                  ) : (
                    <>
                      <CircleDashed size={13} /> {t("student.trackViewer.quizRequired")}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="aspect-video bg-black flex items-center justify-center">
              {selectedLesson.videoPath ? (
                selectedLesson.videoPath.startsWith("/uploads/") ? (
                  <video
                    key={`video-${selectedLesson.id}`}
                    src={selectedLesson.videoPath}
                    controls
                    preload="auto"
                    className="w-full h-full bg-black object-contain"
                    onTimeUpdate={(event) => {
                      const video = event.currentTarget;

                      if (!video.duration || Number.isNaN(video.duration)) {
                        return;
                      }

                      const percent = Math.round(
                        (video.currentTime / video.duration) * 100
                      );

                      // Write to refs only (no re-render) to prevent video remounting
                      watchedPercentRef.current = percent;
                      lastPositionRef.current = Math.round(video.currentTime);
                    }}
                    onPause={saveProgressNow}
                    onEnded={saveProgressNow}
                  />
                ) : (
                  <SecureHlsPlayer
                    src={`/api/student/lessons/${selectedLesson.id}/video/index.m3u8`}
                    onProgress={(playedPercent, playedSeconds) => {
                      setWatchedPercentDraft(playedPercent);
                      setLastPositionDraft(playedSeconds);
                    }}
                  />
                )
              ) : (
                <p className="text-muted-foreground">
                  {t("student.trackViewer.noVideo")}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-border">
              <h4 className="font-bold text-foreground mb-2">{t("student.trackViewer.lessonNotes")}</h4>
              <div className="text-muted-foreground text-sm leading-relaxed min-h-[60px]">
                {selectedLesson.notes || t("student.trackViewer.noNotes")}
              </div>
            </div>
          </div>

          {selectedLesson.resources && selectedLesson.resources.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-foreground">
                {t("student.trackViewer.downloads")}
              </h4>

              {selectedLesson.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-xl hover:border-[#E5C158]/30 hover:bg-[#E5C158]/5 transition group"
                >
                  <span className="font-medium text-muted-foreground group-hover:text-[#E5C158] transition">
                    {resource.name}
                  </span>
                  <span className="text-sm text-[#E5C158] font-bold opacity-0 group-hover:opacity-100 transition">
                    {t("student.trackViewer.open")}
                  </span>
                </a>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">Video Progress</h3>
                {savingProgress && (
                  <span className="text-xs font-bold text-[#E5C158] flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Auto-saving...
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t("student.trackViewer.videoWatchPercentage")}
                </label>

                <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#E5C158] transition-all duration-300"
                    style={{ width: `${watchedPercentDraft}%` }}
                  />
                </div>

                <div className="text-sm text-muted-foreground mt-2">
                  {t("student.trackViewer.current")}: {watchedPercentDraft}%
                </div>
              </div>
            </div>

            <div
              className={`bg-card border rounded-2xl p-6 space-y-4 ${
                selectedLesson.isCompleted
                  ? "border-green-500/30"
                  : "border-border"
              }`}
            >
              <h3 className="font-bold text-foreground">
                {t("student.trackViewer.markLessonComplete")}
              </h3>

              <p className="text-sm text-muted-foreground">
                {t("student.trackViewer.markCompleteDescription")}
              </p>

              {!selectedLesson.isCompleted &&
                selectedLesson.hasQuiz &&
                !selectedLesson.quizPassed && (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle
                      size={16}
                      className="text-amber-400 mt-0.5 shrink-0"
                    />
                    <p className="text-sm text-amber-300 font-medium">
                      {t("student.trackViewer.completeQuizFirst")}
                    </p>
                  </div>
                )}

              <button
                type="button"
                onClick={() => void markLessonComplete()}
                disabled={
                  markingComplete ||
                  selectedLesson.isCompleted ||
                  !selectedLesson.isUnlocked ||
                  (selectedLesson.hasQuiz && !selectedLesson.quizPassed)
                }
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition ${
                  selectedLesson.isCompleted
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-[#E5C158] text-black hover:bg-[#f1d06e] disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                {markingComplete ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t("student.trackViewer.marking")}
                  </>
                ) : selectedLesson.isCompleted ? (
                  <>
                    <CheckCircle2 size={16} />
                    {t("student.trackViewer.completed")}
                  </>
                ) : (
                  t("student.trackViewer.markAsComplete")
                )}
              </button>
            </div>
          </div>

          {selectedLesson.hasQuiz && (
            <StudentQuizPanel
              lessonId={selectedLesson.id}
              onSubmitted={fetchTrack}
            />
          )}

          <StudentQAPanel lessonId={selectedLesson.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              {t("student.trackViewer.portal").replace("{name}", user?.name || "")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("student.trackViewer.trackPrefix").replace("{track}", track.title)}</p>
          </div>

          {track.overallProgress === 100 ? (
            <button
              type="button"
              onClick={() => void claimCertificate()}
              disabled={claimingCert}
              className="px-6 py-3 bg-[#E5C158] text-black font-bold rounded-xl hover:bg-[#f1d06e] transition flex items-center gap-2 shrink-0"
            >
              {claimingCert ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Medal size={18} />
              )}
              {claimingCert ? t("student.trackViewer.generating") : t("student.trackViewer.claimCertificate")}
            </button>
          ) : (
            <div className="text-right shrink-0">
              <div className="text-sm text-muted-foreground mb-1">
                {t("student.trackViewer.overallProgress")}
              </div>
              <div className="text-2xl font-black text-[#E5C158]">
                {track.overallProgress}%
              </div>
            </div>
          )}
        </div>

        {selectedLessonId && currentLessonInfo && (
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#E5C158] uppercase tracking-widest mb-1">
                {t("student.trackViewer.continueLearning")}
              </p>
              <p className="text-lg font-bold">{track.title}</p>
              <p className="text-sm text-muted-foreground">
                {currentLessonInfo.phase} — {currentLessonInfo.module}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveView("lesson")}
              className="px-6 py-3 border border-border rounded-xl font-bold hover:bg-muted transition flex items-center gap-2 shrink-0"
            >
              {t("student.trackViewer.goToLesson")} <ArrowRight size={16} className="rtl:-scale-x-100" />
            </button>
          </div>
        )}

        {track.phases.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {track.phases.map((phase) => {
              const phaseLessons = phase.modules.flatMap((mod) => mod.lessons);

              const completed = phaseLessons.filter(
                (lesson) => lesson.isCompleted
              ).length;

              const total = phaseLessons.length;
              const percent =
                total > 0 ? Math.round((completed / total) * 100) : 0;

              const isLocked =
                phaseLessons.length > 0 &&
                !phaseLessons[0].isUnlocked &&
                !phaseLessons[0].isCompleted;

              return (
                <div
                  key={phase.id}
                  className={`bg-card border rounded-xl p-4 transition-all ${
                    isLocked
                      ? "border-border opacity-50"
                      : percent === 100
                      ? "border-[#E5C158]/30"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm truncate">
                      {phase.title}
                    </h3>

                    {isLocked ? (
                      <Lock
                        size={16}
                        className="text-muted-foreground shrink-0"
                      />
                    ) : percent === 100 ? (
                      <CheckCircle2
                        size={16}
                        className="text-[#E5C158] shrink-0"
                      />
                    ) : null}
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {completed}/{total} {t("student.trackViewer.lessonsCompleted")}
                  </p>

                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent === 100 ? "bg-[#E5C158]" : "bg-indigo-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {percent}%
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {track.phases.length > 0 ? (
          track.phases.map((phase, phaseIndex) => {
            const phaseLessons = phase.modules.flatMap((mod) => mod.lessons);

            const isLocked =
              phaseLessons.length > 0 &&
              !phaseLessons[0].isUnlocked &&
              !phaseLessons[0].isCompleted;

            const isExpanded = expandedPhases.includes(phase.id);

            return (
              <div key={phase.id} className="space-y-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPhases((prev) =>
                      prev.includes(phase.id)
                        ? prev.filter((id) => id !== phase.id)
                        : [...prev, phase.id]
                    )
                  }
                  className="flex items-center gap-3 group w-full text-left"
                >
                  <h2
                    className={`text-xl font-black ${
                      isLocked ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {phase.title}
                  </h2>

                  {isExpanded ? (
                    <ChevronDown size={18} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={18} className="text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-4">
                    {phase.modules.length > 0 ? (
                      phase.modules.map((mod, moduleIndex) => (
                        <div
                          key={mod.id}
                          className="bg-card border border-border rounded-2xl overflow-hidden"
                        >
                          <div className="flex items-center gap-3 p-4 border-b border-border">
                            <span className="w-7 h-7 rounded-lg bg-[#E5C158]/10 text-[#E5C158] flex items-center justify-center text-xs font-black shrink-0">
                              {phaseIndex + 1}
                            </span>

                            <span className="font-bold text-sm">
                              {mod.title}
                            </span>

                            <div className="ml-auto">
                              {mod.lessons.every((lesson) => lesson.isCompleted) &&
                              mod.lessons.length > 0 ? (
                                <CheckCircle2 size={18} className="text-[#E5C158]" />
                              ) : null}
                            </div>
                          </div>

                          <div className="divide-y divide-border">
                            {mod.lessons.map((lesson, lessonIndex) => {
                              const isSelected = selectedLessonId === lesson.id;

                              return (
                                <button
                                  key={lesson.id}
                                  type="button"
                                  disabled={!lesson.isUnlocked}
                                  onClick={() => {
                                    if (lesson.isUnlocked) {
                                      setSelectedLessonId(lesson.id);
                                      setActiveView("lesson");
                                    }
                                  }}
                                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all ${
                                    isSelected ? "bg-[#E5C158]/5" : "hover:bg-muted"
                                  } ${
                                    !lesson.isUnlocked
                                      ? "opacity-40 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">
                                    {moduleIndex + 1}.{lessonIndex + 1}
                                  </span>

                                  <span
                                    className={`text-sm font-medium flex-1 truncate ${
                                      isSelected ? "text-[#E5C158]" : "text-foreground"
                                    }`}
                                  >
                                    {lesson.title}
                                  </span>

                                  <div className="shrink-0">
                                    {lesson.isCompleted ? (
                                      <CheckCircle2 className="text-[#E5C158]" size={18} />
                                    ) : lesson.isUnlocked ? (
                                      <PlayCircle className="text-muted-foreground" size={18} />
                                    ) : (
                                      <Lock className="text-muted-foreground" size={18} />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm py-4 pl-4">
                        No modules in this phase.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-12">
            No phases or lessons in this track yet.
          </div>
        )}
      </div>
    </div>
  );
}