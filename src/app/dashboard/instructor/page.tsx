"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import AnimatedTabs from "@/components/forgeui/animated-tabs";
import {
  NotificationList,
  NotificationItem,
} from "@/components/animate-ui/components/community/notification-list";
import StripedRowsTable, { Track } from "@/components/ui/StripedRowsTable";
import { RevenueChart } from "@/components/ui/RevenueChart";
import {
  Users,
  BookOpen,
  Wallet,
  Activity,
  Megaphone,
  AlertCircle,
  MessageSquare,
  CheckSquare,
  ArrowRight,
  LogOut,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type TrackStatus = "DRAFT" | "PUBLISHED";

type CategoryValue =
  | string
  | {
      id?: string;
      name?: string;
      slug?: string;
    }
  | null
  | undefined;

type DashboardCourse = Track & {
  status?: TrackStatus;
  category?: CategoryValue;
  categoryId?: string | null;
  thumbnail?: string | null;
};

interface UploadResponse {
  message?: string;
  url?: string;
  name?: string;
  file?: {
    storageKey?: string;
    url?: string;
    contentType?: string;
    size?: number;
    filename?: string;
  };
  error?: string;
}

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
    title: "New Student",
    subtitle: "Sarah enrolled in Admin Masterclass",
    time: "just now",
  },
  {
    id: 2,
    title: "5-Star Review!",
    subtitle: "David left a review on Designer Masterclass",
    time: "2 hours ago",
  },
  {
    id: 3,
    title: "Payout Initiated",
    subtitle: "Stripe payout of $1,200 is on the way",
    time: "yesterday",
  },
];

function getCategoryName(category: CategoryValue): string {
  if (typeof category === "string") {
    return category || "Uncategorized";
  }

  return category?.name || "Uncategorized";
}

function getCategoryId(
  categoryId: unknown,
  category: CategoryValue
): string | null {
  if (typeof categoryId === "string") {
    return categoryId;
  }

  if (typeof category === "object" && category?.id) {
    return category.id;
  }

  return null;
}

export default function InstructorDashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  const [tracks, setCourses] = useState<DashboardCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [editingCourse, setEditingCourse] = useState<DashboardCourse | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<TrackStatus>("DRAFT");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [thumbnail, setThumbnail] = useState("");

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [realStats, setRealStats] = useState<{
    totalStudents: number;
    totalRevenue: number;
    avgCompletion: number;
    unansweredQA: number;
  } | null>(null);

  const resetForm = (): void => {
    setTitle("");
    setDescription("");
    setPrice("");
    setStatus("DRAFT");
    setCategoryId("");
    setThumbnail("");
    setEditingCourse(null);
  };

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoadingCourses(true);

      const res = await fetch("/api/tracks", { cache: "no-store" });

      if (res.ok) {
        const data = await res.json();

        const normalizedCourses: DashboardCourse[] = Array.isArray(data?.tracks)
          ? data.tracks.map((track: DashboardCourse) => ({
              ...track,

              category: getCategoryName(track.category),

              categoryId: getCategoryId(track.categoryId, track.category),

              status:
                track.status === "PUBLISHED" || track.status === "DRAFT"
                  ? track.status
                  : "DRAFT",

              thumbnail:
                typeof track.thumbnail === "string" ? track.thumbnail : null,
            }))
          : [];

        setCourses(normalizedCourses);
      } else {
        setCourses([]);
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
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      void fetchCourses();

      fetch("/api/categories")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data?.categories) {
            setCategories(data.categories);
          }
        })
        .catch(console.error);

      fetch("/api/instructor/stats")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data) {
            setRealStats(data);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadingThumbnail(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse | null = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Failed to upload thumbnail");
        return;
      }

      const uploadedUrl = data?.url || data?.file?.url;

      if (uploadedUrl) {
        setThumbnail(uploadedUrl);
      } else {
        alert("Upload succeeded but no image URL was returned");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the track thumbnail");
    } finally {
      setUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  const removeThumbnail = (): void => {
    setThumbnail("");
  };

  const handleEditCourse = async (
    e: React.FormEvent
  ): Promise<void> => {
    e.preventDefault();

    if (!editingCourse) return;

    try {
      const res = await fetch(`/api/tracks/${editingCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price) || 0,
          status,
          categoryId: categoryId.trim() || null,
          thumbnail: thumbnail.trim() || null,
        }),
      });

      if (res.ok) {
        resetForm();
        await fetchCourses();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to update track");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the track");
    }
  };

  const deleteCourse = async (id: string): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this track?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/tracks/${id}`, { method: "DELETE" });

      if (res.ok) {
        await fetchCourses();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to delete track");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the track");
    }
  };

  const openEditModal = (track: DashboardCourse): void => {
    setEditingCourse(track);
    setTitle(track.title);
    setDescription(track.description);
    setPrice(track.price.toString());
    setStatus(track.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
    setCategoryId(track.categoryId || "");
    setThumbnail(track.thumbnail || "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground animate-pulse">
          Loading teaching dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: t("instructor.dashboard.stats.students"),
      value: realStats ? realStats.totalStudents.toLocaleString() : "—",
      icon: Users,
      trend: "Across all tracks",
    },
    {
      title: t("instructor.dashboard.stats.completion"),
      value: realStats ? `${realStats.avgCompletion}%` : "—",
      icon: BookOpen,
      trend: "Lesson completion",
    },
    {
      title: t("instructor.dashboard.stats.revenue"),
      value: realStats ? `$${realStats.totalRevenue.toLocaleString()}` : "—",
      icon: Wallet,
      trend: "Completed payments",
    },
    {
      title: t("instructor.dashboard.stats.qa"),
      value: realStats ? realStats.unansweredQA.toString() : "—",
      icon: Activity,
      trend: "Needs reply",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t("instructor.dashboard.welcome").replace("{name}", user?.name || "Instructor")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("instructor.dashboard.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={logout}
              className="hidden sm:flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30"
            >
              <LogOut className="h-4 w-4" /> {t("instructor.dashboard.logout")}
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push("/dashboard/instructor/send-notification")
              }
              className="hidden sm:flex items-center gap-2"
            >
              <Megaphone className="h-4 w-4" /> {t("instructor.dashboard.announce")}
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div
            onClick={() => router.push("/dashboard/instructor/qa")}
            className="flex items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer hover:bg-amber-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">
                {realStats ? realStats.unansweredQA : 0} unanswered Q&amp;A
              </div>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div
            onClick={() => router.push("/dashboard/instructor/assignments")}
            className="flex items-center justify-between p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent cursor-pointer hover:bg-brand-accent/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">
                5 pending assignments
              </div>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div
            onClick={() => router.push("/dashboard/instructor/issues")}
            className="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-rose-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-sm font-medium">1 reported issue</div>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
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
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-brand-primary mt-1">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Revenue &amp; Enrollments (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </motion.div>

        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl"
            >
              <Card className="border-brand-primary/50 shadow-2xl relative overflow-hidden bg-background">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-primary to-brand-accent" />
                <CardHeader>
                  <CardTitle>Edit Track</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEditCourse} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Track Title
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Description
                      </label>
                      <textarea
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Price ($)
                        </label>
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

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Category
                        </label>
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                          <option value="">Select Category</option>
                          {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as TrackStatus)
                        }
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">
                        Track Thumbnail
                      </label>

                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted hover:bg-muted/80 cursor-pointer transition text-sm font-medium">
                          {uploadingThumbnail ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={16} />
                              Upload Image
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={(e) => void handleThumbnailUpload(e)}
                            disabled={uploadingThumbnail}
                          />
                        </label>

                        {thumbnail && (
                          <button
                            type="button"
                            onClick={removeThumbnail}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm"
                          >
                            <X size={16} />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="w-full rounded-lg border border-dashed border-border bg-muted/20 p-4">
                        {thumbnail ? (
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-lg overflow-hidden border bg-background shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumbnail}
                                alt="Track thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="text-sm text-muted-foreground break-all">
                              {thumbnail}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon size={18} />
                            No thumbnail uploaded yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        className="bg-brand-primary text-white hover:bg-brand-primary/90"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          <div className="xl:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">
                {t("instructor.dashboard.yourTracks")}
              </h2>
              <AnimatedTabs
                tabs={[t("admin.tracks.allTracks"), t("shared.published"), t("shared.draft")]}
                variant="default"
              />
            </div>

            <div className="bg-background rounded-xl shadow-sm overflow-hidden">
              {loadingCourses ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">
                  Loading tracks...
                </div>
              ) : (
                <StripedRowsTable
                  tracks={tracks}
                  onEdit={openEditModal}
                  onDelete={deleteCourse}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              {t("instructor.dashboard.recentActivity")}
            </h2>
            <div className="flex justify-start">
              <NotificationList
                notifications={instructorNotifications}
                onViewAll={() =>
                  router.push("/dashboard/instructor/notifications")
                }
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}