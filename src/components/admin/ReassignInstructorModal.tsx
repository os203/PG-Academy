"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

interface ReassignModalProps {
  trackId: string;
  trackTitle: string;
  currentInstructorId?: string;
  onClose: () => void;
  onSuccess: (updatedTrack: { id: string; instructor: { id: string; name: string; email: string } }) => void;
}

interface InstructorData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ReassignInstructorModal({ trackId, trackTitle, currentInstructorId, onClose, onSuccess }: ReassignModalProps) {
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          // Filter only users who can own a track (INSTRUCTOR or ADMIN)
          const validUsers = data.users.filter((u: InstructorData) => u.role === "INSTRUCTOR" || u.role === "ADMIN");
          setInstructors(validUsers);
          
          if (validUsers.length > 0) {
            // Default to the first user who isn't the current instructor, or just the first user
            const defaultUser = validUsers.find((u: InstructorData) => u.id !== currentInstructorId) || validUsers[0];
            setSelectedInstructorId(defaultUser.id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch instructors", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, [currentInstructorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) return;
    
    if (selectedInstructorId === currentInstructorId) {
      alert("Please select a different instructor.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tracks/${trackId}/reassign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newInstructorId: selectedInstructorId }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.track);
        onClose();
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.error || "Failed to reassign instructor");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while reassigning the instructor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card className="border-brand-primary/50 shadow-2xl relative overflow-hidden bg-background">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-500 to-rose-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Reassign Track</CardTitle>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-md">
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">You are reassigning ownership of:</p>
                <p className="font-medium text-foreground">{trackTitle}</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-foreground">Select New Instructor *</label>
                {isLoading ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading available instructors...
                  </div>
                ) : (
                  <select 
                    required 
                    value={selectedInstructorId} 
                    onChange={(e) => setSelectedInstructorId(e.target.value)} 
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {instructors.length === 0 && <option value="">No Instructors Found</option>}
                    {instructors.map((instr) => (
                      <option key={instr.id} value={instr.id} disabled={instr.id === currentInstructorId}>
                        {instr.name} ({instr.email}) {instr.id === currentInstructorId ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 text-white hover:bg-amber-600" disabled={isSubmitting || !selectedInstructorId || selectedInstructorId === currentInstructorId}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Reassign
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
