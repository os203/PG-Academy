"use client";

import React, { useState } from "react";
import { Loader2, Plus, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import { Resource } from "./InstructorTrackManager";

interface LessonResourceManagerProps {
  trackId: string;
  phaseId: string;
  moduleId: string;
  lessonId: string;
  resources: Resource[];
  onChanged: () => void;
}

export default function LessonResourceManager({
  trackId,
  phaseId,
  moduleId,
  lessonId,
  resources,
  onChanged,
}: LessonResourceManagerProps) {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");

  const handleAddResource = async () => {
    if (!name.trim()) {
      alert("Resource name is required");
      return;
    }

    if (uploadMode === "url" && !url.trim()) {
      alert("Resource URL is required");
      return;
    }

    if (uploadMode === "file" && !file) {
      alert("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      let finalUrl = url.trim();

      if (uploadMode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => null);
          throw new Error(err?.error || "File upload failed");
        }

        const uploadData = await uploadRes.json();
        finalUrl = uploadData.url;
      }

      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons/${lessonId}/resources`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), url: finalUrl }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to add resource");
      }

      setName("");
      setUrl("");
      setFile(null);
      setUploadMode("url");
      onChanged();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || "An error occurred");
      } else {
        alert("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    setDeletingId(resourceId);

    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons/${lessonId}/resources/${resourceId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to delete resource");
      }

      onChanged();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || "An error occurred");
      } else {
        alert("An error occurred");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h6 className="font-bold text-foreground flex items-center gap-2 mb-3">
        <FileText size={16} className="text-brand-primary" />
        Track Materials & Attachments
      </h6>

      {resources.length > 0 && (
        <div className="space-y-2 mb-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="flex items-center justify-between bg-muted/30 border border-border rounded-lg p-2 px-3"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <LinkIcon
                  size={14}
                  className="text-muted-foreground shrink-0"
                />
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-brand-primary hover:underline truncate"
                >
                  {res.name}
                </a>
              </div>

              <button
                type="button"
                onClick={() => void handleDeleteResource(res.id)}
                disabled={deletingId === res.id}
                className="text-muted-foreground hover:text-red-500 p-1 rounded transition disabled:opacity-50"
                title="Delete Material"
              >
                {deletingId === res.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-muted/30 p-3 rounded-xl border border-border">
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setUploadMode("url");
              setFile(null);
            }}
            className={`text-xs px-3 py-1.5 font-medium rounded-full transition ${
              uploadMode === "url"
                ? "bg-brand-primary/15 text-brand-primary"
                : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
            }`}
          >
            Link URL
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadMode("file");
              setUrl("");
            }}
            className={`text-xs px-3 py-1.5 font-medium rounded-full transition ${
              uploadMode === "file"
                ? "bg-brand-primary/15 text-brand-primary"
                : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
            }`}
          >
            Upload File
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Material name (e.g. Slides)"
            value={name ?? ""}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
          />

          {uploadMode === "url" ? (
            <input
              key="url-input"
              type="text"
              placeholder="https://..."
              value={url ?? ""}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
            />
          ) : (
            <input
              key="file-input"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
            />
          )}

          <button
            type="button"
            onClick={() => void handleAddResource()}
            disabled={loading}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}