"use client";


type MyCourseCardProps = {
    thumbnail: string;
    courseName: string;
    instructor: string;
    progress: number; 
    onContinue?: () => void;
};

export default function MyCourseCard({
    thumbnail,
    courseName,
    instructor,
    progress,
    onContinue,
}: MyCourseCardProps) {
    const isNotStarted = progress === 0;

    return (
        <div className="min-w-[350px] w-full h-106 max-w-md bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-brand-accent/20 overflow-hidden flex flex-col hover:-translate-y-4 duration-300">

            <img
                src={thumbnail}
                alt={courseName}
                className="w-full h-60 object-cover"
            />

            <div className="p-4 flex flex-col gap-3 flex-grow">

                <div>
                    <h2 className="text-lg font-semibold">{courseName}</h2>
                    <p className="text-sm text-gray-500">{instructor}</p>
                </div>

                {/* Progress Section */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                        <span>22/40 lessons</span>
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
            ${isNotStarted
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-brand-primary hover:bg-brand-hover text-white"
                        }`}
                >
                    {isNotStarted ? "Start" : "Continue Course"}
                </button>
            </div>
        </div>
    );
}