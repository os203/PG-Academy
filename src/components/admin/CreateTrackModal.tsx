"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";

interface CreateTrackModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface InstructorData {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export default function CreateTrackModal({ onClose, onSuccess }: CreateTrackModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [language, setLanguage] = useState("English");
  const [level, setLevel] = useState("All Levels");
  const [thumbnail, setThumbnail] = useState("");
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [instructors, setInstructors] = useState<InstructorData[]>([]);

  const [learningObjectives, setLearningObjectives] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [targetAudience, setTargetAudience] = useState<string[]>([""]);
  const [tagsInput, setTagsInput] = useState("");

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "media">("basic");

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

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchInstructors();
    fetchCategories();
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

     const res = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Failed to upload thumbnail");
        return;
      }

     if (data?.url) {
  setThumbnail(data.url);
}
    } catch (error) {
      console.error(error);
      alert("An error occurred while uploading the track thumbnail");
    } finally {
      setUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const updateListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const filteredObjectives = learningObjectives.filter((s) => s.trim());
      const filteredRequirements = requirements.filter((s) => s.trim());
      const filteredAudience = targetAudience.filter((s) => s.trim());
      const filteredTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle: subtitle.trim() || null,
          description,
          price: parseFloat(price) || 0,
          status,
          categoryId: categoryId.trim() || null,
          thumbnail: thumbnail.trim() || null,
          language,
          level,
          previewVideoUrl: previewVideoUrl.trim() || null,
          learningObjectives: filteredObjectives.length ? JSON.stringify(filteredObjectives) : null,
          requirements: filteredRequirements.length ? JSON.stringify(filteredRequirements) : null,
          targetAudience: filteredAudience.length ? JSON.stringify(filteredAudience) : null,
          tags: filteredTags.length ? JSON.stringify(filteredTags) : null,
          instructorId,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "Failed to create track");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the track");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-muted-foreground";

  const tabCls = (tab: string) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-brand-primary text-white"
        : "text-muted-foreground hover:bg-muted"
    }`;

  const renderDynamicList = (
    label: string,
    items: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateListItem(setter, idx, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeListItem(setter, idx)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addListItem(setter)}
        className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
      >
        <Plus size={14} /> Add item
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <Card className="border-brand-primary/50 shadow-2xl relative overflow-hidden bg-background">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-primary to-brand-accent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Create a New Track</CardTitle>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-md">
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border pb-3">
              <button type="button" className={tabCls("basic")} onClick={() => setActiveTab("basic")}>
                Basic Info
              </button>
              <button type="button" className={tabCls("details")} onClick={() => setActiveTab("details")}>
                Details
              </button>
              <button type="button" className={tabCls("media")} onClick={() => setActiveTab("media")}>
                Media
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* === BASIC TAB === */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Track Title *</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g., Microsoft Power BI for Beginners" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Subtitle</label>
                    <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} placeholder="Short tagline under the title" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description *</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} min-h-[100px]`} placeholder="Full track description..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Price ($) *</label>
                      <input type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Category</label>
                      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Language</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
                        <option value="English">English</option>
                        <option value="Arabic">Arabic</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="German">German</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Level</label>
                      <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                        <option value="All Levels">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Assign Instructor *</label>
                      <select required value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className={inputCls}>
                        {instructors.length === 0 && <option value="">No Instructors Found</option>}
                        {instructors.map((instr) => (
                          <option key={instr.id} value={instr.id}>
                            {instr.name} ({instr.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")} className={inputCls}>
                        <option value="DRAFT">Draft (Hidden)</option>
                        <option value="PUBLISHED">Published (Visible)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* === DETAILS TAB === */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {renderDynamicList("What You'll Learn", learningObjectives, setLearningObjectives, "e.g., Understand the basic features of Power BI")}
                  {renderDynamicList("Requirements / Prerequisites", requirements, setRequirements, "e.g., Basic Excel knowledge")}
                  {renderDynamicList("Who This Track Is For", targetAudience, setTargetAudience, "e.g., Business Professionals who want to analyze data")}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tags</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Comma separated, e.g., Power BI, Data Analysis, Excel"
                      className={inputCls}
                    />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                    {tagsInput && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {tagsInput.split(",").map((tag, i) => tag.trim() && (
                          <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === MEDIA TAB === */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Preview Video URL</label>
                    <input
                      type="url"
                      value={previewVideoUrl}
                      onChange={(e) => setPreviewVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className={inputCls}
                    />
                    <p className="text-xs text-muted-foreground">YouTube or direct video URL for the track preview</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Track Thumbnail</label>
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
                          <div className="w-32 h-20 rounded-lg overflow-hidden border bg-background shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumbnail} alt="Track thumbnail" className="w-full h-full object-cover" />
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
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary text-white hover:bg-brand-primary/90" disabled={isSubmitting || instructors.length === 0}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Create Track
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
