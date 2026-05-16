"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Star,
  Users,
  BookOpen,
  PlayCircle,
  Lock,
  ArrowLeft,
  Globe,
  BarChart3,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  Award,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Lesson {
  id: string;
  title: string;
  order: number;
  duration: number | null;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessonsCount: number;
  totalDuration: number;
  lessons: Lesson[];
}

interface Instructor {
  id: string;
  name: string;
  bio: string | null;
  rating: number;
  reviewCount: number;
  studentsCount: number;
  coursesCount: number;
}

interface CourseDetails {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string;
  language: string;
  level: string;
  previewVideoUrl: string | null;
  learningObjectives: string[];
  requirements: string[];
  targetAudience: string[];
  tags: string[];
  updatedAt: string;
  instructorName: string;
  instructor: Instructor;
  modulesCount: number;
  lessonsCount: number;
  totalDuration: number;
  studentsCount: number;
  rating: number;
  reviewCount: number;
  phases: {
    id: string;
    title: string;
    order: number;
    modules: Module[];
  }[];
}

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDurationShort(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "numeric", year: "numeric" });
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
    } else if (i === full && half) {
      stars.push(
        <div key={i} className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-amber-400/30" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className="w-4 h-4 text-amber-400/30" />);
    }
  }
  return stars;
}

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const trackId = params.trackId as string;

  const [track, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullAudience, setShowFullAudience] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await fetch(`/api/public/tracks/${trackId}`);
        const data = await res.json();
        if (res.ok) {
          setCourse(data.track);
          // Expand first module by default
          const firstPhase = data.track?.phases?.[0];
          if (firstPhase?.modules?.length > 0) {
            setExpandedModules(new Set([firstPhase.modules[0].id]));
          }
        } else {
          setError(data.error || "Failed to load track details.");
        }
      } catch {
        setError("Failed to fetch track details.");
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollmentStatus = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/student/tracks", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && Array.isArray(data?.tracks)) {
          setIsEnrolled(data.tracks.some((c: { id: string }) => c.id === trackId));
        }
      } catch {
        // Ignore error
      }
    };

    fetchCourseDetails();
    checkEnrollmentStatus();
  }, [trackId, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "STUDENT") {
      setEnrollError("Only students can enroll in tracks.");
      return;
    }

    setIsEnrolling(true);
    setEnrollError(null);

    try {
      // Paid track → go through Stripe checkout
      if (track && track.price > 0) {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data?.alreadyEnrolled) {
            setIsEnrolled(true);
          } else {
            setEnrollError(data?.error || "Failed to create checkout session.");
          }
          return;
        }

        // Free after coupon
        if (data.free) {
          setIsEnrolled(true);
          router.push(`/dashboard/student/${trackId}`);
          return;
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Free track → direct enrollment
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEnrollError(data?.error || "Failed to enroll.");
        return;
      }

      setIsEnrolled(true);
      if (!data?.alreadyEnrolled) {
        router.push(`/dashboard/student/tracks/${trackId}`);
      }
    } catch {
      setEnrollError("An error occurred during enrollment.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!track) return;
    const allModuleIds = track.phases.flatMap((p) => p.modules.map((m) => m.id));
    setExpandedModules(new Set(allModuleIds));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-primary h-12 w-12" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-destructive border border-destructive/20 rounded-xl bg-destructive/5 mt-12">
        <h2 className="text-xl font-bold mb-2">Error Loading Track</h2>
        <p>{error || "Track not found"}</p>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ HERO BANNER ═══ */}
      <div className="bg-linear-to-r from-[#0f0a2e] via-[#1a1145] to-[#0d1b3e] text-white relative">
        <div className="max-w-[1340px] mx-auto px-6 py-8 lg:pr-[420px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <button onClick={() => router.back()} className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-gray-500">›</span>
            <span className="text-violet-400 hover:text-violet-300 cursor-pointer">{track.category}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            {track.title}
          </h1>

          {/* Subtitle */}
          {track.subtitle && (
            <p className="text-lg text-gray-300 mb-4 leading-relaxed max-w-3xl">
              {track.subtitle}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm mb-4">
            {track.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-400 text-base">{track.rating}</span>
                <div className="flex items-center">{renderStars(track.rating)}</div>
                <span className="text-violet-400 underline cursor-default">({track.reviewCount.toLocaleString()} ratings)</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-gray-300">
              <Users className="w-4 h-4" />
              {track.studentsCount.toLocaleString()} students
            </div>
          </div>

          {/* Instructor & meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300">
            <span>
              Created by <span className="text-violet-400 underline cursor-default">{track.instructorName}</span>
            </span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Last updated {formatDate(track.updatedAt)}</span>
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {track.language}</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {track.level}</span>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="max-w-[1340px] mx-auto px-6 relative">
        <div className="lg:pr-[420px]">
          {/* LEFT COLUMN */}
          <div className="py-8 space-y-10 min-w-0">

            {/* ── WHAT YOU'LL LEARN ── */}
            {track.learningObjectives.length > 0 && (
              <div className="border border-border rounded-lg p-6 bg-card">
                <h2 className="text-xl font-bold text-foreground mb-4">What you&apos;ll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {track.learningObjectives.map((obj, i) => (
                    <div key={i} className="flex gap-3 text-sm text-foreground/90">
                      <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── EXPLORE RELATED TOPICS (Tags) ── */}
            {track.tags.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Explore related topics</h2>
                <div className="flex flex-wrap gap-2">
                  {track.tags.map((tag, i) => (
                    <span key={i} className="px-4 py-2 text-sm font-medium rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── TRACK CONTENT ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-foreground">Track content</h2>
                <button onClick={expandAll} className="text-sm font-semibold text-brand-primary hover:underline">
                  Expand all sections
                </button>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {track.modulesCount} sections • {track.lessonsCount} lectures
                {track.totalDuration > 0 && ` • ${formatDuration(track.totalDuration)} total length`}
              </div>

              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                {track.phases.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No content available yet.
                  </div>
                ) : (
                  track.phases.map((phase) => (
                    <div key={phase.id} className="divide-y divide-border">
                      {phase.title && (
                        <div className="px-4 py-3 bg-muted/30 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                          {phase.title}
                        </div>
                      )}
                      {phase.modules.map((mod) => {
                        const isExpanded = expandedModules.has(mod.id);
                        return (
                          <div key={mod.id}>
                            <button
                              onClick={() => toggleModule(mod.id)}
                              className="w-full flex items-center justify-between p-4 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                                {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                                {mod.title}
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0 ml-4">
                                {mod.lessonsCount} lectures
                                {mod.totalDuration > 0 && ` • ${formatDuration(mod.totalDuration)}`}
                              </span>
                            </button>
                            {isExpanded && (
                              <div className="divide-y divide-border/50">
                                {mod.lessons.map((lesson) => (
                                  <div key={lesson.id} className="flex items-center justify-between px-4 py-3 pl-10 text-sm hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-3 text-foreground/80">
                                      <PlayCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                      {lesson.title}
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                                      {lesson.duration ? (
                                        <span className="text-xs">{formatDurationShort(lesson.duration)}</span>
                                      ) : null}
                                      <Lock className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── REQUIREMENTS ── */}
            {track.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Requirements</h2>
                <ul className="space-y-2 pl-1">
                  {track.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/60 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── DESCRIPTION ── */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Description</h2>
              <div className={`text-sm text-foreground/80 leading-relaxed whitespace-pre-line ${!showFullDescription && track.description.length > 400 ? "max-h-40 overflow-hidden relative" : ""}`}>
                {track.description}
                {!showFullDescription && track.description.length > 400 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background to-transparent" />
                )}
              </div>
              {track.description.length > 400 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="flex items-center gap-1 mt-2 text-sm font-semibold text-brand-primary hover:underline"
                >
                  {showFullDescription ? "Show less" : "Show more"}
                  {showFullDescription ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* ── WHO THIS TRACK IS FOR ── */}
            {track.targetAudience.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Who this track is for:</h2>
                <div className={`space-y-2 ${!showFullAudience && track.targetAudience.length > 4 ? "max-h-32 overflow-hidden relative" : ""}`}>
                  {track.targetAudience.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/60 shrink-0" />
                      {item}
                    </div>
                  ))}
                  {!showFullAudience && track.targetAudience.length > 4 && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent" />
                  )}
                </div>
                {track.targetAudience.length > 4 && (
                  <button
                    onClick={() => setShowFullAudience(!showFullAudience)}
                    className="flex items-center gap-1 mt-2 text-sm font-semibold text-brand-primary hover:underline"
                  >
                    {showFullAudience ? "Show less" : "Show more"}
                    {showFullAudience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
            )}

            {/* ── INSTRUCTOR ── */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Instructor</h2>
              <p className="text-brand-primary font-semibold text-lg mb-1 hover:underline cursor-default">
                {track.instructor.name}
              </p>
              <div className="flex items-start gap-5 mt-3">
                {/* Avatar placeholder */}
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg">
                  {track.instructor.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1 text-sm text-foreground/80">
                  {track.instructor.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{track.instructor.rating} Instructor Rating</span>
                    </div>
                  )}
                  {track.instructor.reviewCount > 0 && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span>{track.instructor.reviewCount.toLocaleString()} Reviews</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{track.instructor.studentsCount.toLocaleString()} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>{track.instructor.coursesCount} Tracks</span>
                  </div>
                </div>
              </div>
              {track.instructor.bio && (
                <p className="mt-4 text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
                  {track.instructor.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT STICKY SIDEBAR ═══ */}
      <div className="hidden lg:block fixed top-20 right-0 w-[380px] z-20 pointer-events-none" style={{ height: "calc(100vh - 5rem)" }}>
        <div className="h-full flex justify-center" style={{ maxWidth: "calc((100vw - 1340px) / 2 + 380px + 24px)", marginLeft: "auto" }}>
          <div className="w-[340px] pointer-events-auto pt-6 pb-6 overflow-y-auto scrollbar-none">
            <div className="bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
              {/* Thumbnail / Preview Video */}
              <div className="relative w-full aspect-video bg-muted group">
                {track.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Thumbnail
                  </div>
                )}
                {track.previewVideoUrl && (
                  <a
                    href={track.previewVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-8 h-8 text-[#1c1d1f]" />
                    </div>
                    <span className="absolute bottom-4 text-white font-semibold text-sm">Preview this track</span>
                  </a>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* Price */}
                <div className="text-3xl font-extrabold text-foreground">
                  {track.price === 0 ? "Free" : `$${Number(track.price).toFixed(2)}`}
                </div>

                {/* Enroll Error */}
                {enrollError && (
                  <div className="text-sm text-destructive bg-destructive/5 p-3 rounded-md border border-destructive/20">
                    {enrollError}
                  </div>
                )}

                {/* Action Button */}
                {isEnrolled ? (
                  <Button
                    className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-6 text-base"
                    onClick={() => router.push(`/dashboard/student/tracks/${trackId}`)}
                  >
                    Go to Track
                  </Button>
                ) : user && user.role !== "STUDENT" ? (
                  <Button className="w-full bg-muted text-muted-foreground font-bold py-6 text-base cursor-not-allowed" disabled>
                    Only Students Can Enroll
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-6 text-base transition-transform active:scale-[0.98]"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                    {track.price > 0 ? `Buy Now — $${Number(track.price).toFixed(2)}` : "Enroll Now — Free"}
                  </Button>
                )}

                {/* Track includes */}
                <div className="pt-2 space-y-3 text-sm text-foreground/80">
                  <p className="font-semibold text-foreground">This track includes:</p>
                  {track.totalDuration > 0 && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      {formatDuration(track.totalDuration)} of video content
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                    {track.lessonsCount} lectures
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-muted-foreground shrink-0" />
                    {track.level}
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-muted-foreground shrink-0" />
                    Certificate of completion
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    Full lifetime access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE STICKY BOTTOM BAR ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex items-center justify-between gap-4 z-50 shadow-lg">
        <div>
          <div className="text-xl font-extrabold text-foreground">
            {track.price === 0 ? "Free" : `$${Number(track.price).toFixed(2)}`}
          </div>
        </div>
        {isEnrolled ? (
          <Button
            className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 px-8"
            onClick={() => router.push(`/dashboard/student/tracks/${trackId}`)}
          >
            Go to Track
          </Button>
        ) : (
          <Button
            className="bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 px-8"
            onClick={handleEnroll}
            disabled={isEnrolling}
          >
            {isEnrolling ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
            {track.price > 0 ? `Buy Now — $${Number(track.price).toFixed(2)}` : "Enroll Now — Free"}
          </Button>
        )}
      </div>
    </div>
  );
}
