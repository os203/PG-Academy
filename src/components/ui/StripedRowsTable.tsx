"use client";
import { cn } from "@/lib/utils";

// --- Mock Data ---
interface DataItem {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "pending" | "offline" | "error";
    amount: string;
    enrollments: number;
    date: string;
    avatar: string;
}

const DATA: DataItem[] = [
    { id: "USR-001", name: "Elena Roderick", email: "elena@corp.ai", role: "Admin", status: "active", amount: "$12,500.00", enrollments: 84, date: "Oct 24, 2024", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" },
    { id: "USR-002", name: "Marcus Kane", email: "m.kane@tech.io", role: "Developer", status: "pending", amount: "$8,450.00", enrollments: 42, date: "Oct 22, 2024", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100" },
    { id: "USR-003", name: "Sarah Lin", email: "sarah.l@design.co", role: "Designer", status: "active", amount: "$9,200.00", enrollments: 105, date: "Oct 21, 2024", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100" },
    { id: "USR-004", name: "David Black", email: "d.black@security.net", role: "Manager", status: "offline", amount: "$15,000.00", enrollments: 16, date: "Oct 20, 2024", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100" },
    { id: "USR-005", name: "Priya Mehta", email: "p.mehta@analytics.io", role: "Analyst", status: "error", amount: "$7,800.00", enrollments: 2, date: "Oct 19, 2024", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&h=100" },
    { id: "USR-006", name: "James Thorne", email: "j.thorne@sys.com", role: "Engineer", status: "active", amount: "$11,100.00", enrollments: 68, date: "Oct 18, 2024", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100" },
];

// --- Shared Components ---

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        offline: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
        error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };

    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide", styles[status])}>
            <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", status === 'active' ? 'bg-emerald-400' : status === 'pending' ? 'bg-amber-400' : status === 'error' ? 'bg-rose-400' : 'bg-zinc-400')} />
            {status}
        </span>
    );
};

const AvatarCell = ({ url, name, email }: { url: string; name: string; email: string }) => (
    <div className="flex items-center gap-3">
        <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10">
            <img src={url} alt={name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-200">{name}</span>
            <span className="text-[10px] text-zinc-500">{email}</span>
        </div>
    </div>
);

// --- 4. Striped Rows Table ---
export default function StripedRowsTable() {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Enrollments</th>
                        <th className="px-6 py-4 text-right">Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    {DATA.map((item, idx) => (
                        <tr
                            key={item.id}
                            className={cn(
                                "transition-colors hover:bg-muted/80",
                                idx % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                            )}
                        >
                            <td className="px-6 py-3.5 font-medium text-foreground">{item.role} Masterclass</td>
                            <td className="px-6 py-3.5"><StatusBadge status={item.status} /></td>
                            <td className="px-6 py-3.5 text-right font-medium text-muted-foreground">{item.enrollments} Active</td>
                            <td className="px-6 py-3.5 text-right font-mono text-brand-primary">{item.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}