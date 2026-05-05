"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  CheckCircle2, 
  Info, 
  BookOpen, 
  Sparkles, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Optional: revert optimistic update here if needed
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === "all" ? true : !n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case "welcome": return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case "course_update": return <BookOpen className="w-5 h-5 text-purple-400" />;
      case "enrollment": return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "alert": return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-neutral-400 flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-500" />
            Notifications
          </h1>
          <p className="text-neutral-400 mt-2">
            Stay updated with your learning progress and system alerts.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-full"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === "all" 
              ? "bg-white/10 text-white" 
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            filter === "unread" 
              ? "bg-indigo-500/20 text-indigo-300" 
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">You&apos;re all caught up!</h3>
            <p className="text-neutral-400">
              {filter === "unread" 
                ? "You don't have any unread notifications." 
                : "You don't have any notifications yet."}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 group ${
                  notification.isRead 
                    ? "bg-white/5 border-white/5" 
                    : "bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-12 bg-indigo-500 rounded-r-full" />
                )}
                
                <div className={`p-3 rounded-xl shrink-0 ${notification.isRead ? 'bg-white/5' : 'bg-indigo-500/10'}`}>
                  {getIconForType(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h3 className={`text-base font-semibold truncate ${notification.isRead ? 'text-neutral-200' : 'text-white'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-medium text-neutral-500 shrink-0 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm ${notification.isRead ? 'text-neutral-400' : 'text-neutral-300'}`}>
                    {notification.subtitle}
                  </p>
                </div>

                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full shrink-0 absolute right-4 top-1/2 -translate-y-1/2 md:relative md:right-auto md:top-auto md:translate-y-0"
                    title="Mark as read"
                  >
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
