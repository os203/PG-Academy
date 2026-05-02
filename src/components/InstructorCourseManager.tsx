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

interface Lesson {
  id: string;
  title: string;
  notes: string | null;
  videoPath: string | null;
  order: number;
  quizzes: QuizMeta[];
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
      alert("عنوان الوحدة مطلوب");
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
        alert(data?.error || "فشل إنشاء الوحدة");
        return;
      }

      setNewModuleTitle("");
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إنشاء الوحدة");
    } finally {
      setAddingModule(false);
    }
  };

  const deleteModule = async (moduleId: string): Promise<void> => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذه الوحدة؟");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.details || data?.error || "فشل حذف الوحدة");
        return;
      }

      if (editingModuleId === moduleId) {
        setEditingModuleId(null);
      }

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف الوحدة");
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
      alert("عنوان الوحدة مطلوب");
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
        alert(data?.error || "فشل تعديل الوحدة");
        return;
      }

      setEditingModuleId(null);
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تعديل الوحدة");
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
      alert("عنوان الدرس مطلوب");
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
        alert(data?.error || "فشل إنشاء الدرس");
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
      alert("حدث خطأ أثناء إنشاء الدرس");
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
      alert("عنوان الدرس مطلوب");
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
        alert(data?.error || "فشل تعديل الدرس");
        return;
      }

      setEditingLessonId(null);
      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تعديل الدرس");
    } finally {
      setSavingLessonId(null);
    }
  };

  const deleteLesson = async (
    moduleId: string,
    lessonId: string
  ): Promise<void> => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الدرس؟");
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
        alert(data?.details || data?.error || "فشل حذف الدرس");
        return;
      }

      if (editingLessonId === lessonId) {
        setEditingLessonId(null);
      }

      await fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف الدرس");
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
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-10 text-center font-bold text-red-500">
        الكورس غير موجود أو لا تملك صلاحية الوصول إليه
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-3xl font-black mb-2">{course.title}</h1>
        <p className="opacity-80 flex items-center gap-2 mb-2">
          <Layers size={16} />
          إدارة محتوى الكورس
        </p>
        <p className="text-sm opacity-80">
          {course.description || "لا يوجد وصف لهذا الكورس"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-2xl p-6 shadow-sm sticky top-6">
            <h3 className="font-bold mb-4">إضافة وحدة جديدة</h3>

            <input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="عنوان الوحدة..."
            />

            <button
              onClick={() => void addModule()}
              disabled={addingModule}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-70"
            >
              {addingModule ? "جاري الحفظ..." : "حفظ الوحدة"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="text-indigo-600" />
            هيكلية المنهج
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
                  className="bg-white border rounded-2xl p-5 shadow-sm space-y-5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-xl font-black text-gray-200 mt-1">
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
                              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="عنوان الوحدة"
                            />

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => void saveModuleEdit(module.id)}
                                disabled={savingModuleId === module.id}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
                              >
                                {savingModuleId === module.id ? (
                                  <>
                                    <Loader2 size={16} className="animate-spin" />
                                    جاري الحفظ...
                                  </>
                                ) : (
                                  <>
                                    <Save size={16} />
                                    حفظ
                                  </>
                                )}
                              </button>

                              <button
                                onClick={cancelEditModule}
                                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition"
                              >
                                <X size={16} />
                                إلغاء
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {module.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              عدد الدروس: {module.lessons.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {!moduleIsEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditModule(module)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="تعديل الوحدة"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => void deleteModule(module.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="حذف الوحدة"
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
                            className="border rounded-xl p-4 bg-gray-50 space-y-4"
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
                                  placeholder="عنوان الدرس"
                                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                                  placeholder="ملاحظات / وصف الدرس"
                                  rows={3}
                                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
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
                                  placeholder="مسار الفيديو أو رابطه"
                                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      void saveLessonEdit(module.id, lesson.id)
                                    }
                                    disabled={savingLessonId === lesson.id}
                                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
                                  >
                                    {savingLessonId === lesson.id ? (
                                      <>
                                        <Loader2 size={16} className="animate-spin" />
                                        جاري الحفظ...
                                      </>
                                    ) : (
                                      <>
                                        <Save size={16} />
                                        حفظ
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={cancelEditLesson}
                                    className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition"
                                  >
                                    <X size={16} />
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                                      <Video size={16} />
                                    </div>

                                    <div>
                                      <h5 className="font-bold text-gray-800">
                                        {lessonIndex + 1}. {lesson.title}
                                      </h5>

                                      {lesson.videoPath && (
                                        <p className="text-xs text-gray-500 break-all">
                                          مسار الفيديو: {lesson.videoPath}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => startEditLesson(lesson)}
                                      className="p-2 text-gray-400 hover:text-indigo-600 transition"
                                      title="تعديل الدرس"
                                    >
                                      <Pencil size={16} />
                                    </button>

                                    <button
                                      onClick={() =>
                                        void deleteLesson(module.id, lesson.id)
                                      }
                                      disabled={deletingLessonId === lesson.id}
                                      className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                                      title="حذف الدرس"
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
                                  <div className="text-sm text-gray-600 bg-white border rounded-lg p-3">
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
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400">
                        لا توجد دروس داخل هذه الوحدة بعد.
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h5 className="font-bold flex items-center gap-2 text-gray-700">
                      <Plus size={16} className="text-indigo-600" />
                      إضافة درس جديد
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
                      placeholder="عنوان الدرس"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
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
                      placeholder="ملاحظات / وصف الدرس"
                      rows={3}
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                      placeholder="مسار الفيديو أو رابطه"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                      onClick={() => void addLesson(module.id)}
                      disabled={addingLessonFor === module.id}
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70"
                    >
                      {addingLessonFor === module.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          حفظ الدرس
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400">
              لا توجد وحدات بعد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}