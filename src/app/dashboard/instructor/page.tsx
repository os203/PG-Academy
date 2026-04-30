"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  ChevronRight,
  Trash2,
  Loader2,
  X,
  Pencil,
  Save,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "DRAFT" | "PUBLISHED";
}

interface CoursesResponse {
  courses?: Course[];
  error?: string;
}

interface ApiMessageResponse {
  error?: string;
  message?: string;
}

async function readJsonSafely<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text.trim()) {
    return null;
  }

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editStatus, setEditStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCourses = async (): Promise<void> => {
    try {
      const res = await fetch("/api/courses", {
        cache: "no-store",
      });

      const data = await readJsonSafely<CoursesResponse>(res);

      if (!res.ok) {
        console.error(data?.error || "Failed to fetch courses");
        setCourses([]);
        return;
      }

      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (error) {
      console.error(error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCourses();
  }, []);

  const deleteCourse = async (id: string): Promise<void> => {
    const confirmed = window.confirm("هل أنت متأكد من حذف الكورس نهائياً؟");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (res.ok) {
        await fetchCourses();
      } else {
        alert(data?.error || "فشل حذف الكورس");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف الكورس");
    }
  };

  const createCourse = async (): Promise<void> => {
    if (!title.trim()) {
      alert("عنوان الكورس مطلوب");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
        }),
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "فشل إنشاء الكورس");
        return;
      }

      setTitle("");
      setDescription("");
      setPrice("0");
      setShowCreateForm(false);
      await fetchCourses();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إنشاء الكورس");
    } finally {
      setCreating(false);
    }
  };

  const startEditCourse = (course: Course): void => {
    setEditingCourseId(course.id);
    setEditTitle(course.title);
    setEditDescription(course.description || "");
    setEditPrice(String(course.price ?? 0));
    setEditStatus(course.status);
  };

  const cancelEditCourse = (): void => {
    setEditingCourseId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPrice("0");
    setEditStatus("DRAFT");
  };

  const saveCourseEdit = async (): Promise<void> => {
    if (!editingCourseId) return;

    if (!editTitle.trim()) {
      alert("عنوان الكورس مطلوب");
      return;
    }

    setSavingEdit(true);

    try {
      const res = await fetch(`/api/courses/${editingCourseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          price: editPrice,
          status: editStatus,
        }),
      });

      const data = await readJsonSafely<ApiMessageResponse>(res);

      if (!res.ok) {
        alert(data?.error || "فشل تعديل الكورس");
        return;
      }

      cancelEditCourse();
      await fetchCourses();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تعديل الكورس");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-10 gap-4 flex-wrap">
        <h1 className="text-3xl font-extrabold">كورساتي التعليمية</h1>

        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-md hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          إنشاء كورس جديد
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">إنشاء كورس جديد</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 text-gray-400 hover:text-red-500 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الكورس"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف الكورس"
              rows={4}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="السعر"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={() => void createCourse()}
              disabled={creating}
              className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {creating ? "جاري الإنشاء..." : "حفظ الكورس"}
            </button>
          </div>
        </div>
      )}

      {editingCourseId && (
        <div className="mb-8 bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">تعديل الكورس</h2>
            <button
              onClick={cancelEditCourse}
              className="p-2 text-gray-400 hover:text-red-500 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="عنوان الكورس"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="وصف الكورس"
              rows={4}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="السعر"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={editStatus}
              onChange={(e) =>
                setEditStatus(e.target.value as "DRAFT" | "PUBLISHED")
              }
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="DRAFT">مسودة</option>
              <option value="PUBLISHED">منشور</option>
            </select>

            <button
              onClick={() => void saveCourseEdit()}
              disabled={savingEdit}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {savingEdit ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={16} />
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl text-gray-500">
          لا توجد كورسات بعد. ابدأ بإنشاء أول كورس.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all p-6 overflow-hidden relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditCourse(course)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition"
                    title="تعديل الكورس"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => void deleteCourse(course.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                    title="حذف الكورس"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 truncate">{course.title}</h3>

              <p className="text-sm text-gray-500 mb-3 line-clamp-3 min-h-[60px]">
                {course.description || "لا يوجد وصف لهذا الكورس"}
              </p>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="font-bold text-indigo-600">
                  {Number(course.price).toFixed(2)}$
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">
                  {course.status === "DRAFT" ? "مسودة" : "منشور"}
                </span>
              </div>

              <Link
                href={`/dashboard/instructor/${course.id}`}
                className="flex items-center justify-between w-full bg-gray-50 group-hover:bg-indigo-50 p-3 rounded-xl text-indigo-600 font-bold transition-all"
              >
                إدارة المحتوى
                <ChevronRight size={20} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}