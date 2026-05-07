"use client";

import { Heart } from "lucide-react";

type CourseCardForSaleProps = {
    thumbnail: string;
    category: string;
    title: string;
    instructor: string;
    rating: number; // من 5
    studentsCount?: number;
    price: number;
    isWishlisted?: boolean;
    isEnrolled?: boolean;
    isProcessing?: boolean;
    onToggleWishlist?: () => void;
    onEnroll?: () => void;
};

export default function CourseCardForSale({
    thumbnail ,
    category,
    title,
    instructor,
    rating,
    studentsCount,
    price,
    isWishlisted,
    isEnrolled,
    isProcessing,
    onToggleWishlist,
    onEnroll,
}: CourseCardForSaleProps) {
    return (
        <div className="min-w-[350px] w-full h-106 max-w-md bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-brand-accent/20 overflow-hidden flex flex-col hover:-translate-y-4 duration-300">
            <div className="relative">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-56 object-cover"
                    loading="lazy"
                />

                {/* ❤️ Wishlist */}
                <button
                    onClick={onToggleWishlist}
                    className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800 p-2 rounded-full shadow hover:scale-110 transition"
                >
                    <Heart
                        className={`w-5 h-5 ${isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600 dark:text-gray-300"
                            }`}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3 flex-grow">

                {/* Category */}
                <span className="text-xs text-brand-accent font-medium p-1 px-3 rounded-xl bg-brand-accent/20 dark:bg-brand-accent/10 w-fit">
                    {category}
                </span>

                {/* Title + Instructor */}
                <div>
                    <h2 className="text-lg font-semibold line-clamp-2">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500">{instructor}</p>
                </div>

                {/* Rating + StudentsCount */}
                <div className="flex items-center justify-between text-sm">

                    {/* ⭐ Rating */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>
                                {i < Math.round(rating) ? "⭐" : "☆"}
                            </span>
                        ))}
                        <span className="ml-1 text-gray-500">
                            ({rating})
                        </span>
                    </div>

                    {/*  StudentsCount */}
                    <span className="text-gray-500">
                        {studentsCount?.toLocaleString() || "0"} 👥
                    </span>
                </div>
                <div className="flex items-center  justify-between">
                    <div className="text-lg font-bold text-brand-accent">
                        ${price}
                    </div>

                    <button
                        onClick={onEnroll}
                        className={`bg-brand-primary text-white font-medium transition-all duration-300 p-2 hover:bg-brand-hover`}
                    >
                        {isEnrolled ? "Enrolled (View Details)" : "View Details"}
                    </button>
                </div>
            </div>
        </div>
    );
}