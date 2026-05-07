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
    const label = buttonLabel ?? (isNotStarted ? "Start" : "Continue Course");

    return (
        <div className="min-w-[350px] w-full h-106 max-w-md bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-brand-accent/20 overflow-hidden flex flex-col hover:-translate-y-4 duration-300">

            <img
                src={thumbnail}
                alt={courseName}
                className="w-full h-56 object-cover"
            />

            <div className="p-4 flex flex-col gap-2 flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-brand-accent font-medium p-1 px-3 rounded-xl bg-brand-accent/20 dark:bg-brand-accent/10 w-fit">
                        {category ?? "General"}
                    </span>
                    {statusBadge && (
                        <span className={`text-xs font-medium p-1 px-3 rounded-xl w-fit ${
                            statusBadge === "PUBLISHED"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : "bg-amber-500/20 text-amber-500"
                        }`}>
                            {statusBadge === "PUBLISHED" ? "Published" : "Draft"}
                        </span>
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-semibold">{courseName}</h2>
                    <p className="text-sm text-gray-500">{instructor}</p>
                </div>

                {/* Progress Section */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                        <span>
                            {studentCount !== undefined
                                ? `${studentCount} student${studentCount !== 1 ? "s" : ""}`
                                : `${completedLessons}/${totalLessons} lessons`}
                        </span>
                        <span>{progress}%</span>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={onContinue}
                    className={`mt-auto w-full py-2 font-medium transition-all shadow-brand-primary/25
            ${buttonLabel
                            ? "bg-brand-primary hover:bg-brand-hover text-white"
                            : isNotStarted
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-brand-primary hover:bg-brand-hover text-white"
                        }`}
                >
                    {label}
                </button>
            </div>
        </div>
    );
}