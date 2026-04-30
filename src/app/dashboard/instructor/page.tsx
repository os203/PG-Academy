"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import AnimatedTabs from "@/components/forgeui/animated-tabs";
import { NotificationList, NotificationItem } from "@/components/animate-ui/components/community/notification-list";
import StripedRowsTable, { Course } from "@/components/ui/StripedRowsTable";
import { RevenueChart } from "@/components/ui/RevenueChart";
import { Users, BookOpen, Wallet, Activity, Plus, Megaphone, AlertCircle, MessageSquare, CheckSquare, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const instructorNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'New Student',
    subtitle: 'Sarah enrolled in Admin Masterclass',
    time: 'just now',
  },
  {
    id: 2,
    title: '5-Star Review!',
    subtitle: 'David left a review on Designer Masterclass',
    time: '2 hours ago',
  },
  {
    id: 3,
    title: 'Payout Initiated',
    subtitle: 'Stripe payout of $1,200 is on the way',
    time: 'yesterday',
  },
];

export default function InstructorDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
      }
    } catch (error) {
      console.error(error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      void fetchCourses();
    }
  }, [user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price: parseFloat(price) || 0 }),
      });
      if (res.ok) {
        setShowCreateForm(false);
        setTitle("");
        setDescription("");
        setPrice("");
        await fetchCourses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price: parseFloat(price) || 0 }),
      });
      if (res.ok) {
        setEditingCourse(null);
        setTitle("");
        setDescription("");
        setPrice("");
        await fetchCourses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCourse = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this course?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) await fetchCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setPrice(course.price.toString());
    setShowCreateForm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground animate-pulse">Loading teaching dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const stats = [
    { title: "Total Students", value: "1,248", icon: Users, trend: "+12%" },
    { title: "Active Learners", value: "892", icon: Activity, trend: "This week" },
    { title: "Avg. Completion", value: "68%", icon: BookOpen, trend: "+2.4%" },
    { title: "Total Revenue", value: "$8,450", icon: Wallet, trend: "+24%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section with CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.name || "Instructor"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here is what&apos;s happening with your courses today.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              <Megaphone className="h-4 w-4" /> Announce
            </Button>
            <Button onClick={() => { setShowCreateForm(true); setEditingCourse(null); setTitle(""); setDescription(""); setPrice(""); }} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Create Course
            </Button>
          </div>
        </motion.div>

        {/* Needs Attention / To-Do Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => router.push('/dashboard/instructor/qa')}
            className="flex items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer hover:bg-amber-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">14 unanswered Q&A</div>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div 
            onClick={() => router.push('/dashboard/instructor/assignments')}
            className="flex items-center justify-between p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent cursor-pointer hover:bg-brand-accent/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">5 pending assignments</div>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div 
            onClick={() => router.push('/dashboard/instructor/issues')}
            className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-rose-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">1 reported issue</div>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-border shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-brand-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-brand-primary mt-1">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Revenue & Enrollment Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Revenue & Enrollments (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* Create / Edit Form Overlay */}
        {(showCreateForm || editingCourse) && (
          <motion.div variants={itemVariants}>
            <Card className="border-brand-primary/50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent"></div>
              <CardHeader>
                <CardTitle>{editingCourse ? "Edit Course" : "Create a New Course"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingCourse ? handleEditCourse : handleCreateCourse} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Course Title</label>
                    <input 
                      type="text" 
                      required 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea 
                      required 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price ($)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      required 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); setEditingCourse(null); setTitle(""); setDescription(""); setPrice(""); }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-brand-primary text-white hover:bg-brand-primary/90">
                      {editingCourse ? "Save Changes" : "Create Course"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Split */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Courses Table */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">Your Courses</h2>
              <AnimatedTabs 
                tabs={["All Courses", "Published", "Drafts"]} 
                variant="default"
              />
            </div>
            
            <div className="bg-background rounded-xl shadow-sm overflow-hidden">
              {loadingCourses ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">Loading courses...</div>
              ) : (
                <StripedRowsTable courses={courses} onEdit={openEditModal} onDelete={deleteCourse} />
              )}
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <div className="flex justify-start">
               <NotificationList 
                  notifications={instructorNotifications} 
                  onViewAll={() => router.push('/dashboard/instructor/notifications')}
               />
            </div>
          </div>
          
        </motion.div>

      </motion.div>
    </div>
  );
}
