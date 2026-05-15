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
  Save,
  X,
} from "lucide-react";
import LessonQuizManager, { QuizMeta } from "@/components/LessonQuizManager";
import LessonResourceManager from "@/components/LessonResourceManager";
import EditCourseDetailsModal from "@/components/admin/EditCourseDetailsModal";
import dynamic from 'next/dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface Lesson {
  id: string;
  title: string;
  notes: string | null;
  videoPath: string | null;
  order: number;
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
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
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
  quizzes?: ApiQuiz[];
  resources?: Resource[];
}

interface ApiModule {
  id?: string;
  title?: string;
  order?: number;
  lessons?: ApiLesson[];
}

interface ApiCourseResponse {
  id?: string;
  title?: string;
  description?: string;
  modules?: ApiModule[];
  error?: string;
}

interface ApiMessageResponse {
  error?: string;
  message?: string;
  details?: string;
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

export default function InstructorCourseManager({
  courseId,
}: {
  courseId: string;
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

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

  const fetchCourseData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch(`/api/courses/${courseId}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await readJsonSafely<ApiCourseResponse>(res);

      if (!res.ok || !data) {
        console.error(data?.error || "Failed to fetch course");
        setCourse(null);
        return;
      }

      const normalizedCourse: Course = {
        id: data.id ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        modules: Array.isArray(data.modules)
          ? data.modules.map((module): Module => ({
              id: module.id ?? "",
              title: module.title ?? "",
              order: typeof module.order === "number" ? module.order : 0,
              lessons: Array.isArray(module.lessons)
                ? module.lessons.map((lesson): Lesson => ({
                    id: lesson.id ?? "",
                    title: lesson.title ?? "",
                    notes: lesson.notes ?? null,
                    videoPath: lesson.videoPath ?? null,
                    order: typeof lesson.order === "number" ? lesson.order : 0,
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
                      ? lesson.resources.map((res: { id?: string; name?: string; url?: string }) => ({
                          id: res.id ?? "",
                          name: res.name ?? "",
                          url: res.url ?? "",
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
  }, [courseId]);

  useEffect(() => {
    void fetchCourseData();
  }, [fetchCourseData]);

  const addModule = async (): Promise<void> => {
    if (!newModuleTitle.trim()) {
      alert("Module title is required");
      return;
    }

    setAddingModule(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newModuleTitle.trim(),
        }),
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "Failed to create module");
        return;
      }

      setNewModuleTitle("");
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the module");
    } finally {
      setAddingModule(false);
    }
  };

  const deleteModule = async (moduleId: string): Promise<void> => {
    const confirmed = window.confirm("Are you sure you want to delete this module?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to delete module");
        return;
      }

      if (editingModuleId === moduleId) {
        setEditingModuleId(null);
      }

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the module");
    }
  };

  const startEditModule = (module: Module): void => {
    setEditingModuleId(module.id);
    setModuleDrafts((prev: Record<string, string>) => ({
      ...prev,
      [module.id]: module.title,
    }));
  };

  const cancelEditModule = (): void => {
    setEditingModuleId(null);
  };

  const saveModuleEdit = async (moduleId: string): Promise<void> => {
    const draftTitle = moduleDrafts[moduleId]?.trim() || "";

    if (!draftTitle) {
      alert("Module title is required");
      return;
    }

    setSavingModuleId(moduleId);

    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draftTitle,
        }),
      });

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

  const handleNewLessonInputChange = (
    moduleId: string,
    field: keyof LessonFormState,
    value: string
  ): void => {
    setNewLessonInputs((prev: Record<string, LessonFormState>) => ({
      ...prev,
      [moduleId]: {
        title: prev[moduleId]?.title || "",
        notes: prev[moduleId]?.notes || "",
        videoPath: prev[moduleId]?.videoPath || "",
        [field]: value,
      },
    }));
  };

  const addLesson = async (moduleId: string): Promise<void> => {
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
        `/api/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        [moduleId]: {
          title: "",
          notes: "",
          videoPath: "",
        },
      }));

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the lesson");
    } finally {
      setAddingLessonFor(null);
    }
  };

  const startEditLesson = (lesson: Lesson): void => {
    setEditingLessonId(lesson.id);
    setLessonEditInputs((prev: Record<string, LessonFormState>) => ({
      ...prev,
      [lesson.id]: {
        title: lesson.title,
        notes: lesson.notes || "",
        videoPath: lesson.videoPath || "",
      },
    }));
  };

  const cancelEditLesson = (): void => {
    setEditingLessonId(null);
  };

  const handleLessonEditChange = (
    lessonId: string,
    field: keyof LessonFormState,
    value: string
  ): void => {
    setLessonEditInputs((prev: Record<string, LessonFormState>) => ({
      ...prev,
      [lessonId]: {
        title: prev[lessonId]?.title || "",
        notes: prev[lessonId]?.notes || "",
        videoPath: prev[lessonId]?.videoPath || "",
        [field]: value,
      },
    }));
  };

  const saveLessonEdit = async (
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
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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

  const deleteLesson = async (
    moduleId: string,
    lessonId: string
  ): Promise<void> => {
    const confirmed = window.confirm("Are you sure you want to delete this lesson?");
    if (!confirmed) return;

    setDeletingLessonId(lessonId);

    try {
      const res = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        {
          method: "DELETE",
        }
      );

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "Failed to delete lesson");
        return;
      }

      if (editingLessonId === lessonId) {
        setEditingLessonId(null);
      }

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the lesson");
    } finally {
      setDeletingLessonId(null);
    }
  };

  const normalizedModules = useMemo<Module[]>(() => {
    if (!course?.modules || !Array.isArray(course.modules)) {
      return [];
    }

    return course.modules.map((module) => ({
      ...module,
      lessons: Array.isArray(module.lessons) ? module.lessons : [],
    }));
  }, [course]);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-10 text-center font-bold text-red-500">
        Course not found or you do not have permission to access it
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="bg-linear-to-r from-brand-primary to-brand-accent rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black mb-2">{course.title}</h1>
            <p className="opacity-80 flex items-center gap-2 mb-2">
              <Layers size={16} />
              Course Content Management
            </p>
            <p className="text-sm opacity-80">
              {course.description || "No description for this course"}
            </p>
          </div>
          <button
            onClick={() => setShowEditDetailsModal(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold transition-all border border-white/20"
          >
            <Pencil size={16} />
            Edit Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
            <h3 className="font-bold mb-4 text-foreground">Add New Module</h3>

            <input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-brand-primary text-foreground placeholder:text-muted-foreground bg-background"
              placeholder="Module title..."
            />

            <button
              onClick={() => void addModule()}
              disabled={addingModule}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-70"
            >
              {addingModule ? "Saving..." : "Save Module"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <LayoutGrid className="text-brand-primary" />
            Curriculum Structure
          </h2>

          {normalizedModules.length > 0 ? (
            normalizedModules.map((module, index) => {
              const currentNewLessonInput: LessonFormState =
                newLessonInputs[module.id] || {
                  title: "",
                  notes: "",
                  videoPath: "",
                };

              const moduleIsEditing = editingModuleId === module.id;

              return (
                <div
                  key={module.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-xl font-black text-muted-foreground/40 mt-1">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>

                      <div className="flex-1">
                        {moduleIsEditing ? (
                          <div className="space-y-3">
                            <input
                              value={moduleDrafts[module.id] || ""}
                              onChange={(e) =>
                                setModuleDrafts((prev: Record<string, string>) => ({
                                  ...prev,
                                  [module.id]: e.target.value,
                                }))
                              }
                              className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
                              placeholder="Module title"
                            />

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => void saveModuleEdit(module.id)}
                                disabled={savingModuleId === module.id}
                                className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-primary/90 transition disabled:opacity-70"
                              >
                                {savingModuleId === module.id ? (
                                  <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save size={16} />
                                    Save
                                  </>
                                )}
                              </button>

                              <button
                                onClick={cancelEditModule}
                                className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl font-bold hover:bg-muted/80 transition"
                              >
                                <X size={16} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-foreground">
                              {module.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Lessons: {module.lessons.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {!moduleIsEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditModule(module)}
                          className="p-2 text-muted-foreground hover:text-brand-primary transition-colors"
                          title="Edit Module"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => void deleteModule(module.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete Module"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {module.lessons.length > 0 ? (
                      module.lessons.map((lesson, lessonIndex) => {
                        const lessonIsEditing = editingLessonId === lesson.id;
                        const lessonDraft = lessonEditInputs[lesson.id] || {
                          title: lesson.title,
                          notes: lesson.notes || "",
                          videoPath: lesson.videoPath || "",
                        };

                        return (
                          <div
                            key={lesson.id}
                            className="border border-border rounded-xl p-4 bg-muted/30 space-y-4"
                          >
                            {lessonIsEditing ? (
                              <div className="space-y-3">
                                <input
                                  value={lessonDraft.title}
                                  onChange={(e) =>
                                    handleLessonEditChange(
                                      lesson.id,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Lesson title"
                                  className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
                                />

                                <textarea
                                  value={lessonDraft.notes}
                                  onChange={(e) =>
                                    handleLessonEditChange(
                                      lesson.id,
                                      "notes",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Notes / lesson description"
                                  rows={3}
                                  className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary resize-none bg-background text-foreground"
                                />

                                <input
                                  value={lessonDraft.videoPath}
                                  onChange={(e) =>
                                    handleLessonEditChange(
                                      lesson.id,
                                      "videoPath",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Video path or URL"
                                  className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
                                />

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      void saveLessonEdit(module.id, lesson.id)
                                    }
                                    disabled={savingLessonId === lesson.id}
                                    className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-primary/90 transition disabled:opacity-70"
                                  >
                                    {savingLessonId === lesson.id ? (
                                      <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save size={16} />
                                        Save
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={cancelEditLesson}
                                    className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl font-bold hover:bg-muted/80 transition"
                                  >
                                    <X size={16} />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-brand-primary/10 text-brand-primary p-2 rounded-lg">
                                      <Video size={16} />
                                    </div>

                                    <div>
                                      <h5 className="font-bold text-foreground">
                                        {lessonIndex + 1}. {lesson.title}
                                      </h5>

                                      {lesson.videoPath && (
                                        <div className="mt-2 mb-2 w-full max-w-sm rounded-xl overflow-hidden bg-black aspect-video border border-border">
                                          <ReactPlayer
                                            url={`/api/videos/hls/${course.id}/${module.id}/${lesson.id}/index.m3u8`}
                                            width="100%"
                                            height="100%"
                                            controls
                                            config={({
                                              file: {
                                                forceHLS: true,
                                                hlsOptions: {
                                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                  xhrSetup: function (xhr: any) {
                                                    xhr.withCredentials = true;
                                                  },
                                                },
                                              },
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            }) as any}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => startEditLesson(lesson)}
                                      className="p-2 text-muted-foreground hover:text-brand-primary transition"
                                      title="Edit Lesson"
                                    >
                                      <Pencil size={16} />
                                    </button>

                                    <button
                                      onClick={() =>
                                        void deleteLesson(module.id, lesson.id)
                                      }
                                      disabled={deletingLessonId === lesson.id}
                                      className="p-2 text-muted-foreground hover:text-red-500 transition disabled:opacity-50"
                                      title="Delete Lesson"
                                    >
                                      {deletingLessonId === lesson.id ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <Trash2 size={16} />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {lesson.notes && (
                                  <div className="text-sm text-muted-foreground bg-muted/50 border border-border rounded-lg p-3">
                                    {lesson.notes}
                                  </div>
                                )}
                              </>
                            )}

                            <LessonQuizManager
                              courseId={courseId}
                              moduleId={module.id}
                              lessonId={lesson.id}
                              initialQuiz={lesson.quizzes[0] ?? null}
                              onChanged={fetchCourseData}
                            />

                            <LessonResourceManager
                              courseId={courseId}
                              moduleId={module.id}
                              lessonId={lesson.id}
                              resources={lesson.resources || []}
                              onChanged={fetchCourseData}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 bg-muted/30 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                        No lessons in this module yet.
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h5 className="font-bold flex items-center gap-2 text-foreground">
                      <Plus size={16} className="text-brand-primary" />
                      Add New Lesson
                    </h5>

                    <input
                      value={currentNewLessonInput.title}
                      onChange={(e) =>
                        handleNewLessonInputChange(
                          module.id,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Lesson title"
                      className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
                    />

                    <textarea
                      value={currentNewLessonInput.notes}
                      onChange={(e) =>
                        handleNewLessonInputChange(
                          module.id,
                          "notes",
                          e.target.value
                        )
                      }
                      placeholder="Notes / lesson description"
                      rows={3}
                      className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary resize-none bg-background text-foreground"
                    />

                    <input
                      value={currentNewLessonInput.videoPath}
                      onChange={(e) =>
                        handleNewLessonInputChange(
                          module.id,
                          "videoPath",
                          e.target.value
                        )
                      }
                      placeholder="Video path or URL"
                      className="w-full border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary bg-background text-foreground"
                    />

                    <button
                      onClick={() => void addLesson(module.id)}
                      disabled={addingLessonFor === module.id}
                      className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-primary/90 transition disabled:opacity-70"
                    >
                      {addingLessonFor === module.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Save Lesson
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-muted/30 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-medium">
              No modules yet.
            </div>
          )}
        </div>
      </div>

      {/* Edit Course Details Modal */}
      {showEditDetailsModal && (
        <EditCourseDetailsModal
          courseId={courseId}
          onClose={() => setShowEditDetailsModal(false)}
          onSuccess={() => void fetchCourseData()}
        />
      )}
    </div>
  );
}