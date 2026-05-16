"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  Lock,
  PlayCircle,
  Save,
  Medal,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import StudentQuizPanel from "@/components/StudentQuizPanel";
import StudentQAPanel from "@/components/StudentQAPanel";
import dynamic from 'next/dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

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

export default function StudentTrackViewer({
  trackId,
}: {
  trackId: string;
}) {
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

  const fetchTrack = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/tracks/${trackId}`, { cache: "no-store" });
      const data = await res.json() as StudentTrackResponse;

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
        overallProgress: typeof data.overallProgress === "number" ? data.overallProgress : 0,
        phases: normalizedPhases,
      };

      setTrack(normalizedTrack);

      const allLessons = normalizedTrack.phases.flatMap(p => p.modules.flatMap(m => m.lessons));
      if (allLessons.length === 0) {
        setSelectedLessonId(null);
        return;
      }

      const stillExists = allLessons.some((lesson) => lesson.id === selectedLessonId);
      let lessonToSelect = selectedLessonId;
      if (!stillExists) {
        // Select first incomplete but unlocked lesson, or just the first unlocked lesson
        const firstUnlockedLesson = allLessons.find(l => l.isUnlocked && !l.isCompleted) || allLessons.find(l => l.isUnlocked) || allLessons[0];
        lessonToSelect = firstUnlockedLesson.id;
        setSelectedLessonId(firstUnlockedLesson.id);
      }

      // Auto-expand the phase that contains the selected lesson
      const activePhase = normalizedTrack.phases.find(p => p.modules.some(m => m.lessons.some(l => l.id === lessonToSelect)));
      if (activePhase) {
        setExpandedPhases((prev) => prev.includes(activePhase.id) ? prev : [...prev, activePhase.id]);
      }
    } catch (error) {
      console.error(error);
      setTrack(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  const selectedLesson = useMemo(() => {
    if (!track || !selectedLessonId) return null;
    return track.phases
      .flatMap(p => p.modules.flatMap(m => m.lessons))
      .find((lesson) => lesson.id === selectedLessonId) || null;
  }, [track, selectedLessonId]);

  useEffect(() => {
    if (!selectedLesson) return;
    setWatchedPercentDraft(selectedLesson.watchedPercent);
    setLastPositionDraft(selectedLesson.lastPosition);
  }, [selectedLesson]);

  const selectedModule = useMemo(() => {
    if (!track || !selectedLessonId) return null;
    return track.phases.flatMap(p => p.modules).find(m => m.lessons.some(l => l.id === selectedLessonId)) || null;
  }, [track, selectedLessonId]);

  const saveProgress = async (): Promise<void> => {
    if (!selectedLesson) return;
    setSavingProgress(true);

    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: selectedLesson.id,
          watchedPercent: watchedPercentDraft,
          lastPosition: lastPositionDraft,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Failed to save progress");
        return;
      }

      await fetchTrack();
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving progress");
    } finally {
      setSavingProgress(false);
    }
  };

  const claimCertificate = async () => {
    if (!track) return;
    setClaimingCert(true);
    try {
      const res = await fetch(`/api/student/tracks/${trackId}/certificate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || data || "Failed to claim certificate. Ensure all lessons and quizzes are completed.");
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

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center font-bold text-red-500">
        This track is not accessible or you are not enrolled
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar: Scrollable curriculum list */}
      <div className="lg:col-span-1">
        <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-6 space-y-5 max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar">
          <div>
            <h1 className="text-2xl font-black mb-2">{track.title}</h1>
            <p className="text-sm text-gray-500">
              {track.description || "No description for this track"}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Track Progress</span>
              <span>{track.overallProgress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-brand-primary rounded-full transition-all"
                style={{ width: `${track.overallProgress}%` }}
              />
            </div>

            {track.overallProgress === 100 && (
              <button
                onClick={claimCertificate}
                disabled={claimingCert}
                className="w-full py-3 bg-linear-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {claimingCert ? <Loader2 className="animate-spin" size={18} /> : <Medal size={20} />}
                {claimingCert ? "Generating..." : "Claim Certificate"}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {track.phases.length > 0 ? (
              track.phases.map((phase, phaseIndex) => {
                const phaseLessons = phase.modules.flatMap(m => m.lessons);
                const phaseCompleted = phaseLessons.filter(l => l.isCompleted).length;
                const phaseTotal = phaseLessons.length;
                const phasePercent = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
                const phaseIsLocked = phaseLessons.length > 0 && !phaseLessons[0].isUnlocked && !phaseLessons[0].isCompleted;

                return (
                <div key={phase.id} className="space-y-4">
                  <button
                    onClick={() => setExpandedPhases(prev => prev.includes(phase.id) ? prev.filter(id => id !== phase.id) : [...prev, phase.id])}
                    className={`w-full rounded-xl p-3 border transition-all hover:border-indigo-400 ${
                    phaseIsLocked
                      ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                      : phasePercent === 100
                      ? 'bg-green-50 border-green-200'
                      : 'bg-indigo-50/50 border-indigo-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm uppercase tracking-wide text-indigo-800 flex items-center gap-2">
                        {phaseIsLocked ? (
                          <Lock size={14} className="text-gray-400" />
                        ) : phasePercent === 100 ? (
                          <ShieldCheck size={14} className="text-green-600" />
                        ) : null}
                        Phase {phaseIndex + 1}: {phase.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500">
                          {phaseCompleted}/{phaseTotal} · {phasePercent}%
                        </span>
                        {expandedPhases.includes(phase.id) ? (
                          <ChevronDown size={16} className="text-indigo-500" />
                        ) : (
                          <ChevronRight size={16} className="text-indigo-500" />
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          phasePercent === 100 ? 'bg-green-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${phasePercent}%` }}
                      />
                    </div>
                  </button>
                  
                  {expandedPhases.includes(phase.id) && (
                    <div className="space-y-4 pl-2 pt-2">
                      {phase.modules.length > 0 ? (
                        phase.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="border rounded-2xl p-4 bg-gray-50">
                        <h3 className="font-bold text-gray-800 mb-3">
                          {moduleIndex + 1}. {module.title}
                        </h3>

                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => {
                            const isSelected = selectedLessonId === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                disabled={!lesson.isUnlocked}
                                onClick={() => {
                                  if (lesson.isUnlocked) {
                                    setSelectedLessonId(lesson.id);
                                  }
                                }}
                                className={`w-full text-left border rounded-xl p-3 transition ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-50"
                                    : "border-gray-200 bg-white"
                                } ${!lesson.isUnlocked ? "opacity-60 cursor-not-allowed" : "hover:border-indigo-300"}`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                      {lessonIndex + 1}. {lesson.title}
                                    </p>

                                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                                      {lesson.hasQuiz && (
                                        <p>
                                          Quiz:{" "}
                                          {lesson.quizPassed
                                            ? "Passed"
                                            : lesson.attemptCount > 0
                                            ? `Last score ${lesson.latestScore ?? 0}%`
                                            : "Not attempted"}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    {lesson.isCompleted ? (
                                      <CheckCircle2 className="text-green-600" size={18} />
                                    ) : lesson.isUnlocked ? (
                                      <PlayCircle className="text-indigo-600" size={18} />
                                    ) : (
                                      <Lock className="text-gray-400" size={18} />
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm py-4">No modules in this phase.</div>
                  )}
                </div>
              )}
            </div>
          );
        })
            ) : (
              <div className="text-center text-gray-400 py-6">
                No phases or lessons in this track yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedLesson ? (
          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-black mb-2">{selectedLesson.title}</h2>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold">
                      {selectedLesson.watchedPercent}% video progress
                    </span>

                    {selectedLesson.isCompleted ? (
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold inline-flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold inline-flex items-center gap-1">
                        <CircleDashed size={14} />
                        Incomplete
                      </span>
                    )}

                    {selectedLesson.hasQuiz && (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold">
                        {selectedLesson.quizPassed
                          ? "Quiz: Passed"
                          : "Quiz: Required"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-2xl bg-gray-50 p-6 space-y-4">
                <h3 className="font-bold text-gray-800">Lesson Player</h3>

                <div className="border-2 border-dashed rounded-2xl overflow-hidden bg-black text-center text-gray-500 min-h-[400px] flex items-center justify-center">
                  {selectedLesson.videoPath && selectedModule ? (
                    <div className="w-full h-full aspect-video">
                      <ReactPlayer
                        url={`/api/videos/hls/${trackId}/${selectedModule.id}/${selectedLesson.id}/index.m3u8`}
                        width="100%"
                        height="100%"
                        controls
                        playing={true}
                        config={({
                          file: {
                            forceHLS: true,
                            hlsOptions: {
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              xhrSetup: function (xhr: any) {
                                xhr.withCredentials = true;
                              },
                            },
                          },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        }) as any}
                      />
                    </div>
                  ) : (
                    <p>No video uploaded for this lesson yet.</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold mb-2">Lesson Notes</h4>
                  <div className="bg-white border rounded-xl p-4 text-gray-700 min-h-[120px]">
                    {selectedLesson.notes || "No notes for this lesson."}
                  </div>
                </div>

                {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                  <div className="pt-2 border-t">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                      </span>
                      Downloads & Materials
                    </h4>
                    <div className="space-y-2">
                      {selectedLesson.resources.map((res) => (
                        <a
                          key={res.id}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 border rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition group"
                        >
                          <span className="font-medium text-gray-700 group-hover:text-indigo-700 transition">
                            {res.name}
                          </span>
                          <span className="text-sm text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition">
                            Open
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-gray-800">Save Progress</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video Watch Percentage
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={watchedPercentDraft}
                    onChange={(e) => setWatchedPercentDraft(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    Current value: {watchedPercentDraft}%
                  </div>
                </div>

                <button
                  onClick={() => void saveProgress()}
                  disabled={savingProgress}
                  className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-5 py-3 rounded-xl font-bold hover:bg-gray-300 transition disabled:opacity-70"
                >
                  {savingProgress ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Video Position
                </button>
              </div>

              <div className={`border rounded-2xl p-6 space-y-4 ${
                selectedLesson.isCompleted
                  ? 'border-green-200 bg-green-50'
                  : 'border-indigo-200 bg-indigo-50'
              }`}>
                <h3 className={`font-bold ${
                  selectedLesson.isCompleted ? 'text-green-900' : 'text-indigo-900'
                }`}>Mark Lesson Complete</h3>
                <p className="text-sm text-indigo-700">
                  You must explicitly mark this lesson as complete to unlock the next lesson.
                  If there is a quiz, you must pass it first.
                </p>

                {/* Tooltip: Show reason WHY the button is disabled */}
                {!selectedLesson.isCompleted && selectedLesson.hasQuiz && !selectedLesson.quizPassed && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                      Complete the quiz with a passing score before marking this lesson complete.
                    </p>
                  </div>
                )}

                {!selectedLesson.isCompleted && !selectedLesson.isUnlocked && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                      Complete all previous lessons before this one.
                    </p>
                  </div>
                )}

                <button
                  onClick={async () => {
                    setMarkingComplete(true);
                    try {
                      const res = await fetch("/api/student/progress/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lessonId: selectedLesson.id })
                      });
                      if (res.ok) {
                        await fetchTrack();
                      } else {
                        const data = await res.json();
                        alert(data.error || "Failed to mark complete.");
                      }
                    } catch {
                      alert("An error occurred.");
                    } finally {
                      setMarkingComplete(false);
                    }
                  }}
                  disabled={
                    markingComplete ||
                    selectedLesson.isCompleted ||
                    !selectedLesson.isUnlocked ||
                    (selectedLesson.hasQuiz && !selectedLesson.quizPassed)
                  }
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition ${
                    selectedLesson.isCompleted
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {markingComplete ? (
                    <> <Loader2 size={16} className="animate-spin" /> Marking... </>
                  ) : selectedLesson.isCompleted ? (
                     <> <CheckCircle2 size={16} /> Completed </>
                  ) : (
                    "Mark as Complete"
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
        ) : (
          <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
            No lesson selected to display.
          </div>
        )}
      </div>
    </div>
  );
}