"use client";

type MyCourseCardProps = {
    thumbnail: string;
    category: string;
    courseName: string;
    instructor: string;
    totalLessons?: number;
    completedLessons?: number;
    progress: number;
    buttonLabel?: string;
    statusBadge?: "DRAFT" | "PUBLISHED";
    studentCount?: number;
    onContinue?: () => void;
};

export default function MyCourseCard({
    thumbnail,
    category,
    courseName,
    instructor,
    totalLessons = 0,
    completedLessons = 0,
    progress,
    buttonLabel,
    statusBadge,
    studentCount,
    onContinue,
}: MyCourseCardProps) {
    const isNotStarted = progress === 0;
    const isComplete = progress === 100;
    const label = buttonLabel ?? (isComplete ? "Review Track" : isNotStarted ? "Start Track" : "Continue Track");

    return (
        <div className="min-w-[320px] w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm hover:-translate-y-2 hover:shadow-xl dark:hover:border-purple-500/30 dark:hover:shadow-purple-500/10 duration-300 group">
            {/* Thumbnail */}
            <div className="relative overflow-hidden">
                <img
                    src={thumbnail}
                    alt={courseName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isComplete && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                        ✓ Complete
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col gap-3 grow">
                {/* Category + Status */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-brand-accent bg-brand-accent/15 px-3 py-1 rounded-full">
                        {category ?? "General"}
                    </span>
                    {statusBadge && (
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full ${
                            statusBadge === "PUBLISHED"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}>
                            {statusBadge === "PUBLISHED" ? "Published" : "Draft"}
                        </span>
                    )}
                </div>

                {/* Title + Instructor */}
                <div>
                    <h2 className="text-lg font-bold text-foreground leading-tight line-clamp-1">{courseName}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{instructor}</p>
                </div>

                {/* Progress Section */}
                <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">
                            {studentCount !== undefined
                                ? `${studentCount} student${studentCount !== 1 ? "s" : ""}`
                                : `${completedLessons}/${totalLessons} lessons`}
                        </span>
                        <span className={isComplete ? "text-emerald-500 font-bold" : "text-primary dark:text-purple-300 font-bold"}>{progress}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isComplete
                                    ? 'bg-emerald-500'
                                    : 'bg-primary dark:bg-purple-500'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={onContinue}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-2 ${
                        isComplete
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                            : "bg-brand-primary text-white hover:bg-brand-hover shadow-sm"
                    }`}
                >
                    {label}
                </button>
            </div>
        </div>
    );
}