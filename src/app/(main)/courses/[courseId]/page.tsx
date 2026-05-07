"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Users, BookOpen, PlayCircle, Lock, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface Lesson {
  id: string;
  title: string;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  price: number;
  category: string;
  instructorName: string;
  modulesCount: number;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  modules: Module[];
}

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await fetch(`/api/public/courses/${courseId}`);
        const data = await res.json();
        if (res.ok) {
          setCourse(data.course);
        } else {
          setError(data.error || "Failed to load course details.");
        }
      } catch {
        setError("Failed to fetch course details.");
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollmentStatus = async () => {
        if (!user) return;
        try {
            const res = await fetch("/api/student/courses", { cache: "no-store" });
            const data = await res.json();
            if (res.ok && Array.isArray(data?.courses)) {
                setIsEnrolled(data.courses.some((c: { id: string }) => c.id === courseId));
            }
        } catch {
            // Ignore error
        }
    };

    fetchCourseDetails();
    checkEnrollmentStatus();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
        router.push("/login");
        return;
    }

    if (user.role !== "STUDENT") {
        setEnrollError("Only students can enroll in courses.");
        return;
    }

    setIsEnrolling(true);
    setEnrollError(null);

    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEnrollError(data?.error || "Failed to enroll.");
        return;
      }

      if (data?.alreadyEnrolled) {
        setIsEnrolled(true);
      } else {
        setIsEnrolled(true);
        // Optional: Redirect straight to the course player after successful enrollment
        router.push(`/dashboard/student/courses/${courseId}`);
      }
    } catch {
      setEnrollError("An error occurred during enrollment.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-primary h-12 w-12" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-red-500 border border-red-200 rounded-xl bg-red-50 mt-12">
        <h2 className="text-xl font-bold mb-2">Error Loading Course</h2>
        <p>{error || "Course not found"}</p>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
      </button>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full">
              {course.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium text-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 flex items-center">
                <Star className="h-4 w-4 fill-current mr-1" /> {course.rating > 0 ? course.rating : "New"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-primary" /> {course.studentsCount} Students
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-primary" /> {course.lessonsCount} Lessons
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              Created by <span className="font-bold text-foreground">{course.instructorName}</span>
            </div>
          </div>
        </div>

        {/* Floating Action Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-border shadow-xl overflow-hidden rounded-2xl">
            <div className="w-full h-56 relative bg-muted">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Thumbnail
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="text-4xl font-extrabold text-foreground">
                ${Number(course.price).toFixed(2)}
              </div>
              
              {enrollError && (
                  <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                      {enrollError}
                  </div>
              )}

              {isEnrolled ? (
                <Button 
                    className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-6 text-lg"
                    onClick={() => router.push(`/dashboard/student/courses/${courseId}`)}
                >
                    Go to Course
                </Button>
              ) : user && user.role !== "STUDENT" ? (
                <Button 
                    className="w-full bg-muted text-muted-foreground font-bold py-6 text-lg cursor-not-allowed"
                    disabled
                >
                    Only Students Can Enroll
                </Button>
              ) : (
                <Button 
                    className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-6 text-lg transition-transform active:scale-95"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                >
                    {isEnrolling ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                    Enroll Now
                </Button>
              )}
              
              <div className="text-xs text-center text-muted-foreground">
                Full lifetime access • Access on mobile and web
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="pt-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground mb-6">Course Content</h2>
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4 font-medium px-2">
            <span>{course.modulesCount} modules</span>
            <span>{course.lessonsCount} lessons</span>
        </div>
        
        <div className="space-y-4">
          {course.modules.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
              The instructor hasn&apos;t added any modules to this course yet.
            </div>
          ) : (
            course.modules.map((mod, idx) => (
              <div key={mod.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                <div className="bg-muted/50 p-4 font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary text-xs shrink-0">
                    {idx + 1}
                  </span>
                  {mod.title}
                </div>
                <div className="divide-y divide-border">
                  {mod.lessons.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground italic pl-12">No lessons in this module.</div>
                  ) : (
                    mod.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 flex items-center justify-between text-sm hover:bg-muted/30 transition-colors pl-12">
                        <div className="flex items-center gap-3 text-foreground font-medium">
                          <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                          {lesson.title}
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
