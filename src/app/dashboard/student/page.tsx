"use client";

import DashCard from "@/components/ui/dashCard";
import MyCourseCard from "@/components/ui/myCouaseCard";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Clock4, Medal, ChartNoAxesCombined } from 'lucide-react';



export default function StudentDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center p-4"><p className="text-muted-foreground animate-pulse">Loading study dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col  bg-background/95  p-4">
      <div className="w-ful h-32 p-8 " >
        <div className="font-bold text- text-2xl mb-2 tracking-tight">
          Welcome back! 👋
        </div>
        <div className="text-muted-foreground">
          Continue your learning journey
        </div>
      </div>
      <div className="flex gap-6  justify-around flex-wrap">
        <DashCard icon={<BookOpen size={30} />} title="Enrolled Courses" number={5} />
        <DashCard icon={<Clock4 size={30} />} title="Hours Learned" number={5} />
        <DashCard icon={<Medal size={30} />} title="Certificates" number={5} />
        <DashCard icon={<ChartNoAxesCombined size={30} />} title="Streak Days" number={5} />

      </div>
        <span className="pt-16 text-2xl">Continue Learning</span>
      <div className="grid gap-6 gap-y-8 justify-items-center pt-12" style={{"gridTemplateColumns":"repeat(auto-fill, minmax(350px, 1fr))"}}>
        <MyCourseCard
          thumbnail="/taco3.jpg"
          courseName="React for Beginners"
          instructor="John Doe"
          progress={26}
          onContinue={() => console.log("Start course")}
        />
        <MyCourseCard
          thumbnail="/profile.jpg"
          courseName="React for Beginners"
          instructor="John Doe"
          progress={0}
          onContinue={() => console.log("Start course")}
        />
        <MyCourseCard
          thumbnail="/profile.jpg"
          courseName="React for Beginners"
          instructor="John Doe"
          progress={26}
          onContinue={() => console.log("Start course")}
        />
        <MyCourseCard
          thumbnail="/profile.jpg"
          courseName="React for Beginners"
          instructor="John Doe"
          progress={26}
          onContinue={() => console.log("Start course")}
        />
      </div>
    </div>
  );
}
