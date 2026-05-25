"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Plus,
  LayoutGrid,
  Loader2,
  Video,
  Layers,
  Pencil,
  FolderTree,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
} from "lucide-react";
import LessonQuizManager, { QuizMeta } from "@/components/LessonQuizManager";
import LessonResourceManager from "@/components/LessonResourceManager";
import EditTrackDetailsModal from "@/components/admin/EditTrackDetailsModal";
import { useLanguage } from "@/context/LanguageContext";

interface Lesson {
  id: string;
  title: string;
  notes: string | null;
  videoPath: string | null;
  order: number;
  isPublished: boolean;
  quizzes: QuizMeta[];
  resources: Resource[];
}

export interface Resource {
  id: string;
  name: string;
  url: string;
}

interface Module {
  id: string;
  title: string;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
}

interface Phase {
  id: string;
  title: string;
  order: number;
  modules: Module[];
}

interface Track {
  id: string;
  title: string;
  description: string;
  phases: Phase[];
}

interface LessonFormState {
  title: string;
  notes: string;
  videoPath: string;
}

interface ApiQuiz {
  id?: string;
  title?: string;
  passingScore?: number;
  maxAttempts?: number | null;
  lessonId?: string;
}

interface ApiLesson {
  id?: string;
  title?: string;
  notes?: string | null;
  videoPath?: string | null;
  order?: number;
  isPublished?: boolean;
  quizzes?: ApiQuiz[];
  resources?: Resource[];
}

interface ApiModule {
  id?: string;
  title?: string;
  order?: number;
  isPublished?: boolean;
  lessons?: ApiLesson[];
}

interface ApiPhase {
  id?: string;
  title?: string;
  order?: number;
  modules?: ApiModule[];
}

interface ApiCourseResponse {
  id?: string;
  title?: string;
  description?: string;
  phases?: ApiPhase[];
  error?: string;
}

interface ApiMessageResponse {
  error?: string;
  message?: string;
  details?: string;
}

interface VideoUploadResponse extends ApiMessageResponse {
  videoAsset?: {
    id: string;
    lessonId: string;
    originalPath?: string | null;
    hlsManifestPath?: string | null;
    duration?: number | null;
    status?: "PROCESSING" | "READY" | "FAILED";
    errorMessage?: string | null;
  };
}

async function readJsonSafely<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text.trim()) return null;
  if (!contentType.includes("application/json")) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function InstructorTrackManager({
  trackId,
}: {
  trackId: string;
}) {
  const [track, setCourse] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [addingPhase, setAddingPhase] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [phaseDrafts, setPhaseDrafts] = useState<Record<string, string>>({});
  const [savingPhaseId, setSavingPhaseId] = useState<string | null>(null);

  const [newModuleInputs, setNewModuleInputs] = useState<
    Record<string, string>
  >({});
  const [addingModuleFor, setAddingModuleFor] = useState<string | null>(null);

  const [newLessonInputs, setNewLessonInputs] = useState<
    Record<string, LessonFormState>
  >({});
  const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleDrafts, setModuleDrafts] = useState<Record<string, string>>({});
  const [savingModuleId, setSavingModuleId] = useState<string | null>(null);

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonEditInputs, setLessonEditInputs] = useState<
    Record<string, LessonFormState>
  >({});
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [uploadingVideoLessonId, setUploadingVideoLessonId] = useState<
    string | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { t } = useLanguage();

  const fetchCourseData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch(`/api/tracks/${trackId}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await readJsonSafely<ApiCourseResponse>(res);

      if (!res.ok || !data) {
        console.error(data?.error || "Failed to fetch track");
        setCourse(null);
        return;
      }

      const normalizedCourse: Track = {
        id: data.id ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        phases: Array.isArray(data.phases)
          ? data.phases.map((phase): Phase => ({
              id: phase.id ?? "",
              title: phase.title ?? "",
              order: typeof phase.order === "number" ? phase.order : 0,
              modules: Array.isArray(phase.modules)
                ? phase.modules.map((module): Module => ({
                    id: module.id ?? "",
                    title: module.title ?? "",
                    order: typeof module.order === "number" ? module.order : 0,
                    isPublished: !!module.isPublished,
                    lessons: Array.isArray(module.lessons)
                      ? module.lessons.map((lesson): Lesson => ({
                          id: lesson.id ?? "",
                          title: lesson.title ?? "",
                          notes: lesson.notes ?? null,
                          videoPath: lesson.videoPath ?? null,
                          order:
                            typeof lesson.order === "number"
                              ? lesson.order
                              : 0,
                          isPublished: !!lesson.isPublished,
                          quizzes: Array.isArray(lesson.quizzes)
                            ? lesson.quizzes.map((quiz): QuizMeta => ({
                                id: quiz.id ?? "",
                                title: quiz.title ?? "",
                                passingScore:
                                  typeof quiz.passingScore === "number"
                                    ? quiz.passingScore
                                    : 50,
                                maxAttempts:
                                  typeof quiz.maxAttempts === "number"
                                    ? quiz.maxAttempts
                                    : null,
                                lessonId: quiz.lessonId ?? (lesson.id ?? ""),
                              }))
                            : [],
                          resources: Array.isArray(lesson.resources)
                            ? lesson.resources.map(
                                (res: {
                                  id?: string;
                                  name?: string;
                                  url?: string;
                                }) => ({
                                  id: res.id ?? "",
                                  name: res.name ?? "",
                                  url: res.url ?? "",
                                })
                              )
                            : [],
                        }))
                      : [],
                  }))
                : [],
            }))
          : [],
      };

      setCourse(normalizedCourse);
    } catch (error) {
      console.error(error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    void fetchCourseData();
  }, [fetchCourseData]);

  const addPhase = async (): Promise<void> => {
    if (!newPhaseTitle.trim()) {
      alert("Phase title is required");
      return;
    }

    setAddingPhase(true);

    try {
      const res = await fetch(`/api/tracks/${trackId}/phases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newPhaseTitle.trim() }),
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to create phase");
        return;
      }

      setNewPhaseTitle("");
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the phase");
    } finally {
      setAddingPhase(false);
    }
  };

  const deletePhase = async (phaseId: string): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this phase?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/tracks/${trackId}/phases/${phaseId}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to delete phase");
        return;
      }

      if (editingPhaseId === phaseId) setEditingPhaseId(null);

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the phase");
    }
  };

  const savePhaseEdit = async (phaseId: string): Promise<void> => {
    const draftTitle = phaseDrafts[phaseId]?.trim() || "";

    if (!draftTitle) {
      alert("Phase title is required");
      return;
    }

    setSavingPhaseId(phaseId);

    try {
      const res = await fetch(`/api/tracks/${trackId}/phases/${phaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draftTitle }),
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to update phase");
        return;
      }

      setEditingPhaseId(null);
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the phase");
    } finally {
      setSavingPhaseId(null);
    }
  };

  const addModule = async (phaseId: string): Promise<void> => {
    const title = newModuleInputs[phaseId] || "";

    if (!title.trim()) {
      alert("Module title is required");
      return;
    }

    setAddingModuleFor(phaseId);

    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() }),
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to create module");
        return;
      }

      setNewModuleInputs((prev) => ({ ...prev, [phaseId]: "" }));
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the module");
    } finally {
      setAddingModuleFor(null);
    }
  };

  const deleteModule = async (
    phaseId: string,
    moduleId: string
  ): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this module?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}`,
        {
          method: "DELETE",
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to delete module");
        return;
      }

      if (editingModuleId === moduleId) setEditingModuleId(null);

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the module");
    }
  };

  const saveModuleEdit = async (
    phaseId: string,
    moduleId: string
  ): Promise<void> => {
    const draftTitle = moduleDrafts[moduleId]?.trim() || "";

    if (!draftTitle) {
      alert("Module title is required");
      return;
    }

    setSavingModuleId(moduleId);

    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: draftTitle }),
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to update module");
        return;
      }

      setEditingModuleId(null);
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the module");
    } finally {
      setSavingModuleId(null);
    }
  };

  const toggleModulePublish = async (
    phaseId: string,
    moduleId: string,
    currentStatus: boolean
  ): Promise<void> => {
    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !currentStatus }),
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to update module status");
        return;
      }

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating module status");
    }
  };

  const addLesson = async (
    phaseId: string,
    moduleId: string
  ): Promise<void> => {
    const current: LessonFormState = newLessonInputs[moduleId] || {
      title: "",
      notes: "",
      videoPath: "",
    };

    if (!current.title.trim()) {
      alert("Lesson title is required");
      return;
    }

    setAddingLessonFor(moduleId);

    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: current.title.trim(),
            notes: current.notes.trim(),
            videoPath: current.videoPath.trim(),
          }),
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to create lesson");
        return;
      }

      setNewLessonInputs((prev: Record<string, LessonFormState>) => ({
        ...prev,
        [moduleId]: { title: "", notes: "", videoPath: "" },
      }));

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the lesson");
    } finally {
      setAddingLessonFor(null);
    }
  };

  const saveLessonEdit = async (
    phaseId: string,
    moduleId: string,
    lessonId: string
  ): Promise<void> => {
    const draft = lessonEditInputs[lessonId];

    if (!draft || !draft.title.trim()) {
      alert("Lesson title is required");
      return;
    }

    setSavingLessonId(lessonId);

    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draft.title.trim(),
            notes: draft.notes.trim(),
            videoPath: draft.videoPath.trim(),
          }),
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to update lesson");
        return;
      }

      setEditingLessonId(null);
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the lesson");
    } finally {
      setSavingLessonId(null);
    }
  };

  const toggleLessonPublish = async (
    phaseId: string,
    moduleId: string,
    lessonId: string,
    currentStatus: boolean
  ): Promise<void> => {
    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !currentStatus }),
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to update lesson status");
        return;
      }

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating lesson status");
    }
  };

  const deleteLesson = async (
    phaseId: string,
    moduleId: string,
    lessonId: string
  ): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?"
    );
    if (!confirmed) return;

    setDeletingLessonId(lessonId);

    try {
      const res = await fetch(
        `/api/tracks/${trackId}/phases/${phaseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "DELETE",
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to delete lesson");
        return;
      }

      if (editingLessonId === lessonId) setEditingLessonId(null);

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the lesson");
    } finally {
      setDeletingLessonId(null);
    }
  };

  const handleLessonVideoUpload = async (
    phaseId: string,
    moduleId: string,
    lessonId: string,
    file: File | null
  ): Promise<void> => {
    if (!file) return;

    // File format validation
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      alert(t("video.invalidFormat"));
      return;
    }

    // File size validation (500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(t("video.fileTooLarge"));
      return;
    }

    setUploadingVideoLessonId(lessonId);
    setUploadProgress(0);

    try {
      const extension = file.name.split('.').pop() || 'mp4';
      const sanitizedFile = new File([file], `upload_${Date.now()}.${extension}`, { type: file.type });

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<{ ok: boolean; error?: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          try {
            const respData = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && respData?.ok) {
              resolve({ ok: true });
            } else {
              resolve({ ok: false, error: respData?.error || 'Upload failed' });
            }
          } catch {
            resolve({ ok: false, error: 'Invalid response' });
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('POST', '/api/raw-video-upload');
        xhr.setRequestHeader('x-track-id', trackId);
        xhr.setRequestHeader('x-phase-id', phaseId);
        xhr.setRequestHeader('x-module-id', moduleId);
        xhr.setRequestHeader('x-lesson-id', lessonId);
        xhr.setRequestHeader('x-file-name', sanitizedFile.name);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.send(sanitizedFile);
      });

      if (!result.ok) {
        alert(result.error || t("video.uploadFailed"));
        return;
      }

      setUploadProgress(100);
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert(t("video.uploadFailed"));
    } finally {
      setUploadingVideoLessonId(null);
      setUploadProgress(0);
    }
  };

  const normalizedPhases = useMemo<Phase[]>(() => {
    if (!track?.phases || !Array.isArray(track.phases)) {
      return [];
    }

    return track.phases.map((phase) => ({
      ...phase,
      modules: Array.isArray(phase.modules) ? phase.modules : [],
    }));
  }, [track]);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="p-10 text-center font-bold text-red-500">
        Track not found or you do not have permission to access it
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-brand-primary/20 to-transparent p-6 rounded-2xl border border-brand-primary/30 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">{track.title}</h1>
          <div className="flex items-center gap-2 text-brand-primary font-medium text-sm">
            <Layers size={16} />
            {t("instructor.trackManager.title")}
          </div>
          <p className="text-sm opacity-80 mt-2">
            {track.description || t("instructor.trackManager.noDescription")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowEditDetailsModal(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold transition-all border border-white/20"
        >
          <Pencil size={16} />
          {t("instructor.trackManager.editDetails")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
            <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
              <Plus size={18} className="text-brand-primary" /> {t("instructor.trackManager.addPhase")}
            </h3>

            <input
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-brand-primary text-foreground placeholder:text-muted-foreground bg-background"
              placeholder={t("instructor.trackManager.phaseTitle")}
            />

            <button
              type="button"
              onClick={() => void addPhase()}
              disabled={addingPhase}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-70"
            >
              {addingPhase ? t("common.loading") : t("instructor.trackManager.savePhase")}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <LayoutGrid className="text-brand-primary" />
            {t("instructor.trackManager.curriculum")}
          </h2>

          {normalizedPhases.length > 0 ? (
            normalizedPhases.map((phase, phaseIndex) => (
              <div
                key={phase.id}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-start gap-4 pb-4 border-b border-border">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center bg-brand-primary/10 text-brand-primary rounded-xl h-10 w-10 shrink-0 font-black">
                      P{phaseIndex + 1}
                    </div>

                    <div className="flex-1">
                      {editingPhaseId === phase.id ? (
                        <div className="space-y-3 mt-1">
                          <input
                            value={phaseDrafts[phase.id] || ""}
                            onChange={(e) =>
                              setPhaseDrafts((prev) => ({
                                ...prev,
                                [phase.id]: e.target.value,
                              }))
                            }
                            className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
                            placeholder="Phase title"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void savePhaseEdit(phase.id)}
                              disabled={savingPhaseId === phase.id}
                              className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-primary/90 transition disabled:opacity-70 text-sm"
                            >
                              {savingPhaseId === phase.id ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingPhaseId(null)}
                              className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl font-bold hover:bg-muted/80 transition text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-bold text-lg text-foreground mt-1">
                            {phase.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("instructor.trackManager.modules")}: {phase.modules.length}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingPhaseId !== phase.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhaseId(phase.id);
                          setPhaseDrafts((prev) => ({
                            ...prev,
                            [phase.id]: phase.title,
                          }));
                        }}
                        className="p-2 text-muted-foreground hover:text-brand-primary transition-colors"
                        title="Edit Phase"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => void deletePhase(phase.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete Phase"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pl-4 border-l-2 border-brand-primary/20">
                  {phase.modules.length > 0 ? (
                    phase.modules.map((module, moduleIndex) => (
                      <div
                        key={module.id}
                        className="bg-muted/20 border border-border rounded-xl p-5 space-y-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <FolderTree
                              size={18}
                              className="text-muted-foreground mt-1 shrink-0"
                            />

                            <div className="flex-1">
                              {editingModuleId === module.id ? (
                                <div className="space-y-3">
                                  <input
                                    value={moduleDrafts[module.id] || ""}
                                    onChange={(e) =>
                                      setModuleDrafts((prev) => ({
                                        ...prev,
                                        [module.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
                                    placeholder="Module title"
                                  />

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void saveModuleEdit(phase.id, module.id)
                                      }
                                      disabled={savingModuleId === module.id}
                                      className="inline-flex items-center gap-2 bg-brand-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-brand-primary/90 transition disabled:opacity-70 text-xs"
                                    >
                                      {savingModuleId === module.id
                                        ? "Saving..."
                                        : "Save"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setEditingModuleId(null)}
                                      className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-lg font-bold hover:bg-muted/80 transition text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="font-bold text-foreground">
                                    M{moduleIndex + 1}: {module.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {t("instructor.trackManager.lessons")}: {module.lessons.length}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {editingModuleId !== module.id && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  void toggleModulePublish(
                                    phase.id,
                                    module.id,
                                    module.isPublished
                                  )
                                }
                                className={`p-1.5 transition-colors flex items-center gap-1 rounded-md text-xs font-semibold ${
                                  module.isPublished
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-amber-600 hover:bg-amber-50"
                                }`}
                                title={
                                  module.isPublished ? t("instructor.trackManager.published") : t("instructor.trackManager.draft")
                                }
                              >
                                {module.isPublished ? (
                                  <Eye size={16} />
                                ) : (
                                  <EyeOff size={16} />
                                )}
                                <span className="hidden sm:inline">
                                  {module.isPublished ? t("instructor.trackManager.published") : t("instructor.trackManager.draft")}
                                </span>
                              </button>

                              <div className="w-px h-4 bg-border mx-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingModuleId(module.id);
                                  setModuleDrafts((prev) => ({
                                    ...prev,
                                    [module.id]: module.title,
                                  }));
                                }}
                                className="p-1.5 text-muted-foreground hover:text-brand-primary transition-colors"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void deleteModule(phase.id, module.id)
                                }
                                className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {module.lessons.length > 0 ? (
                            module.lessons.map((lesson, lessonIndex) => {
                              const lessonIsEditing =
                                editingLessonId === lesson.id;

                              const lessonDraft = lessonEditInputs[
                                lesson.id
                              ] || {
                                title: lesson.title,
                                notes: lesson.notes || "",
                                videoPath: lesson.videoPath || "",
                              };

                              return (
                                <div
                                  key={lesson.id}
                                  className="border border-border/50 rounded-lg p-4 bg-background shadow-sm space-y-4"
                                >
                                  {lessonIsEditing ? (
                                    <div className="space-y-3">
                                      <input
                                        value={lessonDraft.title}
                                        onChange={(e) =>
                                          setLessonEditInputs((prev) => ({
                                            ...prev,
                                            [lesson.id]: {
                                              ...prev[lesson.id],
                                              title: e.target.value,
                                            },
                                          }))
                                        }
                                        placeholder="Lesson title"
                                        className="w-full border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-sm"
                                      />

                                      <textarea
                                        value={lessonDraft.notes}
                                        onChange={(e) =>
                                          setLessonEditInputs((prev) => ({
                                            ...prev,
                                            [lesson.id]: {
                                              ...prev[lesson.id],
                                              notes: e.target.value,
                                            },
                                          }))
                                        }
                                        placeholder="Notes"
                                        rows={2}
                                        className="w-full border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary resize-none bg-background text-sm"
                                      />

                                      <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground">
                                          Video
                                        </label>

                                        <div className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg px-3 py-2">
                                          Lesson videos should be uploaded from
                                          the dedicated Upload Video button
                                          outside edit mode. This keeps videos
                                          private and converts them to HLS.
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            void saveLessonEdit(
                                              phase.id,
                                              module.id,
                                              lesson.id
                                            )
                                          }
                                          disabled={savingLessonId === lesson.id}
                                          className="bg-brand-primary text-white px-3 py-1.5 rounded-md font-bold hover:bg-brand-primary/90 text-xs"
                                        >
                                          {savingLessonId === lesson.id
                                            ? "Saving..."
                                            : "Save"}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingLessonId(null)
                                          }
                                          className="bg-muted text-muted-foreground px-3 py-1.5 rounded-md font-bold hover:bg-muted/80 text-xs"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                          <div className="bg-brand-primary/10 text-brand-primary p-2 rounded-md">
                                            <Video size={14} />
                                          </div>

                                          <div>
                                            <h5 className="font-bold text-sm text-foreground">
                                              {lessonIndex + 1}. {lesson.title}
                                            </h5>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              void toggleLessonPublish(
                                                phase.id,
                                                module.id,
                                                lesson.id,
                                                lesson.isPublished
                                              )
                                            }
                                            className={`p-1 transition-colors flex items-center gap-1 rounded-md text-xs font-semibold ${
                                              lesson.isPublished
                                                ? "text-emerald-600 hover:bg-emerald-50"
                                                : "text-amber-600 hover:bg-amber-50"
                                            }`}
                                            title={
                                              lesson.isPublished
                                                ? "Published"
                                                : "Draft"
                                            }
                                          >
                                            {lesson.isPublished ? (
                                              <Eye size={14} />
                                            ) : (
                                              <EyeOff size={14} />
                                            )}
                                          </button>

                                          <div className="w-px h-3 bg-border mx-1" />

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingLessonId(lesson.id);
                                              setLessonEditInputs((prev) => ({
                                                ...prev,
                                                [lesson.id]: {
                                                  title: lesson.title,
                                                  notes: lesson.notes || "",
                                                  videoPath:
                                                    lesson.videoPath || "",
                                                },
                                              }));
                                            }}
                                            className="p-1 text-muted-foreground hover:text-brand-primary"
                                          >
                                            <Pencil size={14} />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              void deleteLesson(
                                                phase.id,
                                                module.id,
                                                lesson.id
                                              )
                                            }
                                            disabled={
                                              deletingLessonId === lesson.id
                                            }
                                            className="p-1 text-muted-foreground hover:text-red-500 disabled:opacity-50"
                                          >
                                            {deletingLessonId === lesson.id ? (
                                              <Loader2
                                                size={14}
                                                className="animate-spin"
                                              />
                                            ) : (
                                              <Trash2 size={14} />
                                            )}
                                          </button>
                                        </div>
                                      </div>

                                      <div className="mt-3 border border-dashed border-brand-primary/30 rounded-lg p-3 bg-muted/10">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                          <div>
                                            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                              {lesson.videoPath ? (
                                                <CheckCircle2
                                                  size={14}
                                                  className="text-emerald-500"
                                                />
                                              ) : (
                                                <Video size={14} />
                                              )}
                                              {t("video.lessonVideo")}
                                            </p>

                                            <p className="text-xs text-muted-foreground mt-1">
                                              {lesson.videoPath
                                                ? t("video.hasVideo")
                                                : t("video.noVideo")}
                                            </p>
                                          </div>

                                          <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 cursor-pointer transition">
                                            {uploadingVideoLessonId ===
                                            lesson.id ? (
                                              <>
                                                <Loader2
                                                  size={14}
                                                  className="animate-spin"
                                                />
                                                {t("video.uploading")}
                                              </>
                                            ) : (
                                              <>
                                                <Upload size={14} />
                                                {t("video.upload")}
                                              </>
                                            )}

                                            <input
                                              type="file"
                                              accept=".mp4,.mov,.avi,.webm"
                                              className="hidden"
                                              disabled={
                                                uploadingVideoLessonId ===
                                                lesson.id
                                              }
                                              onChange={(e) => {
                                                const selectedFile =
                                                  e.target.files?.[0] || null;

                                                void handleLessonVideoUpload(
                                                  phase.id,
                                                  module.id,
                                                  lesson.id,
                                                  selectedFile
                                                );

                                                e.target.value = "";
                                              }}
                                            />
                                          </label>
                                        </div>
                                      </div>

                                      {lesson.notes && (
                                        <div className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-md p-2">
                                          {lesson.notes}
                                        </div>
                                      )}
                                    </>
                                  )}

                                  <LessonQuizManager
                                    trackId={trackId}
                                    phaseId={phase.id}
                                    moduleId={module.id}
                                    lessonId={lesson.id}
                                    initialQuiz={lesson.quizzes[0] ?? null}
                                    onChanged={fetchCourseData}
                                  />

                                  <LessonResourceManager
                                    trackId={trackId}
                                    phaseId={phase.id}
                                    moduleId={module.id}
                                    lessonId={lesson.id}
                                    resources={lesson.resources || []}
                                    onChanged={fetchCourseData}
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-4 bg-muted/10 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                              No lessons in this module.
                            </div>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                          <h6 className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                            <Plus size={14} className="text-brand-primary" />{" "}
                            Add Lesson to {module.title}
                          </h6>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              value={newLessonInputs[module.id]?.title || ""}
                              onChange={(e) =>
                                setNewLessonInputs((prev) => ({
                                  ...prev,
                                  [module.id]: {
                                    ...(prev[module.id] || {
                                      notes: "",
                                      videoPath: "",
                                    }),
                                    title: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Lesson title"
                              className="flex-1 border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-sm"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                void addLesson(phase.id, module.id)
                              }
                              disabled={addingLessonFor === module.id}
                              className="bg-brand-primary text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-primary/90 disabled:opacity-70 text-xs shrink-0 whitespace-nowrap"
                            >
                              {addingLessonFor === module.id
                                ? "Adding..."
                                : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-muted/10 border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                      No modules in this phase yet.
                    </div>
                  )}

                  <div className="bg-muted/10 border border-dashed border-brand-primary/30 rounded-xl p-4 mt-4">
                    <h5 className="font-semibold text-sm mb-2 text-foreground flex items-center gap-1.5">
                      <Plus size={14} className="text-brand-primary" /> Add
                      Module to {phase.title}
                    </h5>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={newModuleInputs[phase.id] || ""}
                        onChange={(e) =>
                          setNewModuleInputs((prev) => ({
                            ...prev,
                            [phase.id]: e.target.value,
                          }))
                        }
                        placeholder="Module title"
                        className="flex-1 border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => void addModule(phase.id)}
                        disabled={addingModuleFor === phase.id}
                        className="bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-primary/90 disabled:opacity-70 text-sm whitespace-nowrap"
                      >
                        {addingModuleFor === phase.id
                          ? "Adding..."
                          : "Add Module"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-medium">
              No phases yet. Add a phase to get started.
            </div>
          )}
        </div>
      </div>

      {showEditDetailsModal && (
        <EditTrackDetailsModal
          trackId={trackId}
          onClose={() => setShowEditDetailsModal(false)}
          onSuccess={() => void fetchCourseData()}
        />
      )}
    </div>
  );
}