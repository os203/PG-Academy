"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Upload,
  X,
  FileVideo,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface VideoUploadModalProps {
  trackId: string;
  phaseId: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  hasExistingVideo: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCEPTED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoUploadModal({
  trackId,
  phaseId,
  moduleId,
  lessonId,
  lessonTitle,
  hasExistingVideo,
  onClose,
  onSuccess,
}: VideoUploadModalProps) {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return `Unsupported format. ${t("video.supportedFormats")}`;
    }
    if (f.size > MAX_FILE_SIZE) {
      return t("video.maxSize");
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const error = validateFile(f);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setFile(f);
    setErrorMsg("");
    setStatus("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    const url = `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons/${lessonId}/video`;

    try {
      // Use XMLHttpRequest for upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
            if (pct >= 100) {
              setStatus("processing");
            }
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus("success");
            resolve();
          } else {
            let errMsg = t("video.uploadFailed");
            try {
              const data = JSON.parse(xhr.responseText);
              errMsg = data.error || errMsg;
            } catch { /* ignore parse error */ }
            setErrorMsg(errMsg);
            setStatus("error");
            reject(new Error(errMsg));
          }
        });

        xhr.addEventListener("error", () => {
          setErrorMsg(t("video.uploadFailed"));
          setStatus("error");
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", url);
        xhr.send(formData);
      });

      // Success — wait a moment then call onSuccess
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch {
      // Error already handled in xhr event listeners
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-white">{t("video.upload")}</h3>
            <p className="text-sm text-zinc-500 mt-0.5">{lessonTitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {hasExistingVideo && status === "idle" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Uploading a new video will replace the existing one.
            </div>
          )}

          {/* Drop Zone */}
          {status === "idle" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#bd9759] bg-[#bd9759]/5"
                  : file
                  ? "border-[#bd9759]/30 bg-[#bd9759]/5"
                  : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/avi"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                  e.target.value = "";
                }}
              />

              {file ? (
                <div className="space-y-2">
                  <FileVideo className="h-10 w-10 text-[#bd9759] mx-auto" />
                  <p className="text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                    className="text-xs text-zinc-400 hover:text-white underline"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 text-zinc-600 mx-auto" />
                  <p className="text-sm font-medium text-zinc-300">{t("video.dragDrop")}</p>
                  <p className="text-xs text-zinc-500">{t("video.orBrowse")}</p>
                  <p className="text-xs text-zinc-600 mt-2">{t("video.supportedFormats")}</p>
                  <p className="text-xs text-zinc-600">{t("video.maxSize")}</p>
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {(status === "uploading" || status === "processing") && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileVideo className="h-8 w-8 text-[#bd9759] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file?.name}</p>
                  <p className="text-xs text-zinc-500">{file ? formatFileSize(file.size) : ""}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="progress-gold h-2.5 rounded-full">
                  <div
                    className="progress-gold-bar rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Converting to HLS...
                      </>
                    ) : (
                      `${progress}% uploaded`
                    )}
                  </span>
                  {status === "uploading" && (
                    <span className="text-zinc-500">{progress}%</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto" />
              <p className="text-lg font-bold text-white">{t("video.uploadSuccess")}</p>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center py-6 space-y-3">
              <AlertTriangle className="h-14 w-14 text-red-400 mx-auto" />
              <p className="text-sm font-medium text-red-400">{errorMsg}</p>
              <button
                onClick={resetUpload}
                className="gold-outline-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </button>
            </div>
          )}

          {errorMsg && status === "idle" && (
            <p className="text-sm text-red-400 text-center">{errorMsg}</p>
          )}
        </div>

        {/* Footer */}
        {status === "idle" && (
          <div className="flex justify-end gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleUpload}
              disabled={!file}
              className="gold-btn px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4" />
              {t("video.upload")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
