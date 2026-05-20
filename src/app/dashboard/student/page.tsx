"use client";

import { useEffect, useState } from "react";
import DashCard from "@/components/ui/dashCard";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Clock4,
  Medal,
  ChartNoAxesCombined,
  PlayCircle,
  Lock,
} from "lucide-react";
import {
  NotificationList,
  NotificationItem,
} from "@/components/animate-ui/components/community/notification-list";

interface PhaseSummary {
  id: string;
  title: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isLocked: boolean;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  hoursLearned: number;
  instructorName: string;
  category?: string;
  phases?: PhaseSummary[];
}

interface NotificationsResponse {
  notifications?: NotificationItem[];
}

interface ContinueLearningData {
  trackId: string;
  trackTitle: string;
  phaseTitle: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
}

interface StudentTracksResponse {
  tracks?: EnrolledCourse[];
  continueLearning?: ContinueLearningData | null;
  certificateCount?: number;
  streakDays?: number;
}

export default function StudentDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [tracks, setCourses] = useState<EnrolledCourse[]>([]);
  const [continueLearning, setContinueLearning] = useState<ContinueLearningData | null>(null);
  const [certificateCount, setCertificateCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);

  const totalHoursLearned = tracks.reduce(
    (sum, track) => sum + (track.hoursLearned ?? 0),
    0
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/student/tracks");

        if (res.ok) {
          const data: StudentTracksResponse = await res.json();
          setCourses(Array.isArray(data?.tracks) ? data.tracks : []);
          setContinueLearning(data?.continueLearning || null);
          setCertificateCount(data?.certificateCount ?? 0);
          setStreakDays(data?.streakDays ?? 0);
        } else {
          setCourses([]);
          setContinueLearning(null);
          setCertificateCount(0);
          setStreakDays(0);
        }
      } catch (err) {
        console.error("Failed to fetch tracks", err);
        setCourses([]);
        setContinueLearning(null);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications?limit=3&unreadOnly=true");

        if (res.ok) {
          const data: NotificationsResponse | NotificationItem[] =
            await res.json();

          if (Array.isArray(data)) {
            setNotifications(data);
          } else {
            setNotifications(
              Array.isArray(data?.notifications) ? data.notifications : []
            );
          }
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setNotifications([]);
      } finally {
        setIsNotificationsLoading(false);
      }
    };

    if (!isAuthLoading && user) {
      void fetchCourses();
      void fetchNotifications();
    } else if (!isAuthLoading && !user) {
      setIsCoursesLoading(false);
      setIsNotificationsLoading(false);
    }
  }, [isAuthLoading, user]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground animate-pulse">
          Loading study dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/95 p-4 md:p-8 max-w-7xl mx-auto w-full gap-8">
      {/* Header & Notifications */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
        <div>
          <h1 className="font-black text-3xl mb-1 tracking-tight text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey
          </p>
        </div>

        {!isNotificationsLoading && (
          <div className="w-full md:w-auto z-10">
            <NotificationList
              notifications={notifications}
              onViewAll={() =>
                (window.location.href = "/dashboard/notifications")
              }
            />
          </div>
        )}
      </div>

      {/* Continue Learning Hero Card */}
      {!isCoursesLoading && continueLearning && (
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-linear-to-br from-[#1a0a2e] via-[#0f0520] to-[#0d0f1a] text-white shadow-2xl shadow-purple-500/10">
          <div className="absolute top-0 right-0 p-8 opacity-[0.06] pointer-events-none">
            <BookOpen size={180} />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15)_0%,transparent_50%)]" />
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center rounded-full bg-purple-500/15 px-3 py-1 text-sm font-bold text-purple-300 border border-purple-500/20">
                <PlayCircle size={14} className="mr-2" />
                Up Next
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2 leading-tight">
                  {continueLearning.lessonTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-purple-200/60 text-sm font-medium">
                  <span>{continueLearning.trackTitle}</span>
                  <span className="opacity-50">•</span>
                  <span>{continueLearning.phaseTitle}</span>
                  <span className="opacity-50">•</span>
                  <span>{continueLearning.moduleTitle}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = `/dashboard/student/${continueLearning.trackId}`}
              className="shrink-0 inline-flex items-center gap-2 bg-linear-to-r from-[#E5C158] to-[#f1d06e] hover:from-[#f1d06e] hover:to-[#E5C158] text-[#0d0f1a] font-black px-8 py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(229,193,88,0.25)]"
            >
              Resume Lesson
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-6 justify-around flex-wrap">
        <DashCard
          icon={<BookOpen size={30} />}
          title="Enrolled Tracks"
          number={tracks.length}
        />
        <DashCard
          icon={<Clock4 size={30} />}
          title="Hours Learned"
          number={totalHoursLearned}
        />
        <DashCard icon={<Medal size={30} />} title="Certificates" number={certificateCount} />
        <DashCard
          icon={<ChartNoAxesCombined size={30} />}
          title="Streak Days"
          number={streakDays}
        />
      </div>

      <div className="pt-12">
        <h2 className="text-2xl font-black text-foreground">Your Enrolled Tracks</h2>
        <p className="text-muted-foreground text-sm mt-1">Pick up where you left off and track your progress.</p>
      </div>

      {isCoursesLoading ? (
        <div className="flex justify-center p-12 text-muted-foreground">
          <p className="animate-pulse">Loading your tracks...</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-lg max-w-4xl mx-auto w-full">
          You haven&apos;t enrolled in any tracks yet.
        </div>
      ) : (
        <div className="flex flex-col gap-16 pt-8">
          {tracks.map((track) => (
            <div key={track.id} className="flex flex-col gap-6">
              {/* Track Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  {track.thumbnail && (
                    <Image src={track.thumbnail} alt={track.title} width={64} height={64} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                  )}
                  <div>
                    <h3 className="text-2xl font-black">{track.title}</h3>
                    <p className="text-muted-foreground font-medium">{track.completedLessons} / {track.totalLessons} lessons completed • {track.progressPercentage}%</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = `/dashboard/student/${track.id}`}
                  className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2 rounded-xl font-bold transition-all"
                >
                  {track.progressPercentage === 0 ? "Start Track" : "Continue Track"}
                </button>
              </div>

              {/* Phase Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {track.phases?.map((phase) => (
                  <div
                    key={phase.id}
                    className={`relative flex flex-col p-5 rounded-2xl border transition-all ${phase.isLocked ? 'bg-muted/30 border-border opacity-60' : 'bg-card border-border hover:border-primary/30 dark:hover:border-purple-400/30 hover:shadow-lg dark:hover:shadow-purple-500/5'}`}
                  >
                    {/* Lock Icon */}
                    {phase.isLocked && (
                      <div className="absolute top-4 right-4 text-muted-foreground">
                        <Lock size={18} />
                      </div>
                    )}

                    <div className="mb-5">
                      <span className="text-[10px] font-black text-primary/60 dark:text-purple-400/60 uppercase tracking-widest">Phase {phase.order}</span>
                      <h4 className="text-base font-bold mt-1 line-clamp-1 text-foreground">{phase.title}</h4>
                    </div>

                    <div className="mt-auto space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">{phase.completedLessons}/{phase.totalLessons} lessons</span>
                        <span className={phase.progressPercentage === 100 ? "text-emerald-500 font-bold" : "text-primary dark:text-purple-300"}>{phase.progressPercentage}%</span>
                      </div>

                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${phase.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-primary dark:bg-purple-500'}`}
                          style={{ width: `${phase.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}