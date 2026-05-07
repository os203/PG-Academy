"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface InstructorData {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export default function CreateCourseModal({ onClose, onSuccess }: CreateCourseModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [category, setCategory] = useState("Others");
  const [thumbnail, setThumbnail] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          const instrs = data.users.filter((u: InstructorData) => u.role === "INSTRUCTOR");
          setInstructors(instrs);
          if (instrs.length > 0) {
            setInstructorId(instrs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch instructors", err);
      }
    };
    fetchInstructors();
  }, []);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/course-thumbnail", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Failed to upload thumbnail");
        return;
      }

      if (data?.file?.url) {
        setThumbnail(data.file.url);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the course thumbnail");
    } finally {
      setUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price) || 0,
          status,
          category: category.trim() || null,
          thumbnail: thumbnail.trim() || null,
          instructorId,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to create course");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl my-8">
        <Card className="border-brand-primary/50 shadow-2xl relative overflow-hidden bg-background">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-primary to-brand-accent" />
          <CardHeader>
            <CardTitle>Create a New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assign Instructor</label>
                  <select
                    required
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {instructors.length === 0 && <option value="">No Instructors Found</option>}
                    {instructors.map(instr => (
                      <option key={instr.id} value={instr.id}>{instr.name} ({instr.email})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="DRAFT">Draft (Hidden)</option>
                    <option value="PUBLISHED">Published (Visible)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-foreground">Course Thumbnail</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted hover:bg-muted/80 cursor-pointer transition text-sm font-medium">
                    {uploadingThumbnail ? (
                      <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload size={16} /> Upload Image</>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumbnail}
                    />
                  </label>
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setThumbnail("")}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm"
                    >
                      <X size={16} /> Remove
                    </button>
                  )}
                </div>

                <div className="w-full rounded-lg border border-dashed border-border bg-muted/20 p-4">
                  {thumbnail ? (
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border bg-background shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbnail} alt="Course thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-sm text-muted-foreground break-all">{thumbnail}</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ImageIcon size={18} /> No thumbnail uploaded yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white hover:bg-brand-primary/90" disabled={isSubmitting || instructors.length === 0}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Create Course
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
