"use client";

import { useEffect, useState } from "react";
import DashCard from "@/components/ui/dashCard";
import MyCourseCard from "@/components/ui/myCouaseCard";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Clock4, Medal, ChartNoAxesCombined } from 'lucide-react';
import { NotificationList } from "@/components/animate-ui/components/community/notification-list";
import { NotificationItem } from "@/components/animate-ui/components/community/notification-list";

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
  instructorName: string;
}

export default function StudentDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/student/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setIsCoursesLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications?limit=3&unreadOnly=true");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setIsNotificationsLoading(false);
      }
    };

    if (!isAuthLoading && user) {
      fetchCourses();
      fetchNotifications();
    }
  }, [isAuthLoading, user]);

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center p-4"><p className="text-muted-foreground animate-pulse">Loading study dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col  bg-background/95  p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mb-8 px-4 md:px-8">
        <div className="w-full h-32 pt-8" >
          <div className="font-bold text-2xl mb-2 tracking-tight">
            Welcome back! 👋
          </div>
          <div className="text-muted-foreground">
            Continue your learning journey
          </div>
        </div>
        {!isNotificationsLoading && (
          <div className="w-full md:w-auto z-10 pt-4 md:pt-0">
            <NotificationList 
              notifications={notifications} 
              onViewAll={() => window.location.href = '/dashboard/notifications'} 
            />
          </div>
        )}
      </div>
      <div className="flex gap-6  justify-around flex-wrap">
        <DashCard icon={<BookOpen size={30} />} title="Enrolled Courses" number={courses.length} />
        <DashCard icon={<Clock4 size={30} />} title="Hours Learned" number={5} />
        <DashCard icon={<Medal size={30} />} title="Certificates" number={5} />
        <DashCard icon={<ChartNoAxesCombined size={30} />} title="Streak Days" number={5} />

      </div>
        <span className="pt-16 text-2xl">Continue Learning</span>
      
      {isCoursesLoading ? (
        <div className="flex justify-center p-12 text-muted-foreground">
          <p className="animate-pulse">Loading your courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-lg max-w-4xl mx-auto w-full">
          You haven&apos;t enrolled in any courses yet.
        </div>
      ) : (
        <div className="grid gap-6 gap-y-8 justify-items-center pt-12" style={{"gridTemplateColumns":"repeat(auto-fill, minmax(350px, 1fr))"}}>
          {courses.map((course) => (
            <MyCourseCard
              key={course.id}
              thumbnail={course.thumbnail || "/taco3.jpg"} // Fallback image
              courseName={course.title}
              instructor={course.instructorName}
              progress={course.progressPercentage}
              onContinue={() => window.location.href = `/dashboard/student/courses/${course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
