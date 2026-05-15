"use client";

import { useState } from "react";
import { Send, AlertCircle, Info, Sparkles, BookOpen } from "lucide-react";

interface Track {
  id: string;
  title: string;
}

export default function SendNotificationForm({ tracks }: { tracks: Track[] }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("course_update");
  const [trackId, setCourseId] = useState(""); // empty string means "All Tracks"
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const payload: Record<string, string> = {
        message,
        type,
        targetRole: "ENROLLED_STUDENTS", // Instructors are locked to this target
      };

      if (trackId) {
        payload.trackId = trackId;
      }

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send notifications");
      }

      setFeedback({ type: "success", message: data.message });
      setMessage(""); // Clear the message field after success
    } catch (error) {
      if (error instanceof Error) {
        setFeedback({ type: "error", message: error.message });
      } else {
        setFeedback({ type: "error", message: "An unknown error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-accent flex items-center gap-3">
          <Send className="w-8 h-8 text-brand-primary" />
          Send Track Announcement
        </h1>
        <p className="text-muted-foreground mt-2">
          Broadcast a message to students enrolled in your tracks.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Audience Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <select 
              value={trackId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All My Enrolled Students</option>
              {tracks.map(track => (
                <option key={track.id} value={track.id}>
                  Students in: {track.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Select whether to send to all your students, or only students in a specific track.</p>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notification Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "course_update", label: "Track Update", icon: BookOpen, color: "text-purple-500" },
                { id: "info", label: "General Info", icon: Info, color: "text-blue-500" },
              ].map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                    type === t.id 
                      ? "border-brand-primary bg-brand-primary/10" 
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <t.icon className={`w-5 h-5 ${t.color}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Type your track announcement here..."
              className="w-full bg-background border border-input rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            />
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className={`p-4 rounded-md text-sm flex items-start gap-3 ${
              feedback.type === "success" 
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}>
              {feedback.type === "success" ? <Sparkles className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p>{feedback.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Announcement
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
