"use client";

import { cn } from "@/lib/utils";
import { Pencil, Trash2, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export interface Track {
  id: string;
  title: string;
  description: string;
  price: number;
  status: "DRAFT" | "PUBLISHED";
  thumbnail?: string | null;
  category?: string | null;
}

const StatusBadge = ({ status }: { status: "DRAFT" | "PUBLISHED" }) => {
  const styles = {
    PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
        styles[status]
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          status === "PUBLISHED" ? "bg-emerald-400" : "bg-amber-400"
        )}
      />
      {status}
    </span>
  );
};

export default function StripedRowsTable({
  tracks,
  onEdit,
  onDelete,
}: {
  tracks: Track[];
  onEdit: (track: Track) => void;
  onDelete: (id: string) => void;
}) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-16 bg-background border border-border rounded-xl text-muted-foreground">
        No tracks found. Start by creating your first track.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <th className="px-6 py-4">Track</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Price</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, idx) => (
            <tr
              key={track.id}
              className={cn(
                "transition-colors hover:bg-muted/80 group",
                idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
              )}
            >
              <td className="px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border bg-muted shrink-0 flex items-center justify-center">
                    {track.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={18} className="text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {track.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 max-w-[320px]">
                      {track.description}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-3.5">
                {track.category ? (
                  <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-500">
                    {track.category}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>

              <td className="px-6 py-3.5">
                <StatusBadge status={track.status} />
              </td>

              <td className="px-6 py-3.5 text-right font-mono text-brand-primary">
                ${Number(track.price).toFixed(2)}
              </td>

              <td className="px-6 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(track)}
                    className="p-2 text-muted-foreground hover:text-brand-accent transition"
                    title="Edit Track"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(track.id)}
                    className="p-2 text-muted-foreground hover:text-rose-500 transition"
                    title="Delete Track"
                  >
                    <Trash2 size={16} />
                  </button>

                  <Link
                    href={`/dashboard/instructor/${track.id}`}
                    className="p-2 text-muted-foreground hover:text-brand-primary transition"
                    title="Manage Content"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}