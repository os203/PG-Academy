"use client";

import { Heart } from "lucide-react";
import Image from "next/image";

type TrackCardForSaleProps = {
    thumbnail: string;
    category: string;
    title: string;
    instructor: string;
    rating: number;
    studentsCount?: number;
    price: number;
    isWishlisted?: boolean;
    isEnrolled?: boolean;
    isProcessing?: boolean;
    onToggleWishlist?: () => void;
    onEnroll?: () => void;
};

export default function TrackCardForSale({
    thumbnail,
    category,
    title,
    instructor,
    rating,
    studentsCount,
    price,
    isWishlisted,
    isEnrolled,
    onToggleWishlist,
    onEnroll,
}: TrackCardForSaleProps) {
    return (
        <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-purple-500/10 duration-300 group">
            {/* Thumbnail */}
            <div className="relative h-52 w-full overflow-hidden">
                <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Wishlist */}
                <button
                    onClick={onToggleWishlist}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition border border-white/20"
                >
                    <Heart
                        className={`w-4 h-4 ${isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-gray-500 dark:text-gray-300"
                            }`}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-3 grow">
                {/* Category */}
                <span className="text-[10px] uppercase tracking-wider font-bold text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full w-fit">
                    {category}
                </span>

                {/* Title + Instructor */}
                <div>
                    <h2 className="text-base font-bold text-foreground line-clamp-2 leading-tight">
                        {title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{instructor}</p>
                </div>

                {/* Rating + StudentsCount */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-xs ${i < Math.round(rating) ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}>
                                ★
                            </span>
                        ))}
                        <span className="ml-1.5 text-xs text-muted-foreground">
                            ({rating})
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                        {studentsCount?.toLocaleString() || "0"} 👥
                    </span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <div className="text-xl font-black text-brand-accent">
                        ${price}
                    </div>
                    <button
                        onClick={onEnroll}
                        className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${
                            isEnrolled
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-brand-primary text-white hover:bg-brand-hover shadow-sm"
                        }`}
                    >
                        {isEnrolled ? "Enrolled ✓" : "View Details"}
                    </button>
                </div>
            </div>
        </div>
    );
}