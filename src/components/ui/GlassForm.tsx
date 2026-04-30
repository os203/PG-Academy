"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";

interface GlassFormProps {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    fields?: Array<{ placeholder: string; type?: string }>;
    buttonText?: string;
    onSubmit?: (data: Record<string, string>) => void;
    maxWidth?: string;
    backgroundGradientFrom?: string;
    backgroundGradientVia?: string;
    backgroundGradientTo?: string;
    blob1Color?: string;
    blob2Color?: string;
    blob3Color?: string;
    blobSize?: string;
    blobBlur?: string;
    cardBgColor?: string;
    cardBorderColor?: string;
    iconBgColor?: string;
    iconColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    inputBgColor?: string;
    inputBorderColor?: string;
    inputFocusBgColor?: string;
    inputFocusBorderColor?: string;
    inputTextColor?: string;
    inputPlaceholderColor?: string;
    buttonGradientFrom?: string;
    buttonGradientTo?: string;
    buttonTextColor?: string;
    buttonBorderColor?: string;
    buttonShadowColor?: string;
    shimmerColor?: string;
    className?: string;
}

export const GlassForm: React.FC<GlassFormProps> = ({
    title = "Secure Access",
    subtitle = "Enter your credentials to float.",
    icon = <Lock className="text-white w-6 h-6" />,
    fields = [
        { placeholder: "Email", type: "email" },
        { placeholder: "Password", type: "password" },
    ],
    buttonText = "Authenticate",
    onSubmit,
    maxWidth = "28rem",
    backgroundGradientFrom = "#7c3aed",
    backgroundGradientVia = "#a855f7",
    backgroundGradientTo = "#4f46e5",
    blob1Color = "#ec4899",
    blob2Color = "#eab308",
    blob3Color = "#ec4899",
    blobSize = "8rem",
    blobBlur = "xl",
    cardBgColor = "rgba(255, 255, 255, 0.1)",
    cardBorderColor = "rgba(255, 255, 255, 0.2)",
    iconBgColor = "rgba(255, 255, 255, 0.2)",
    iconColor = "#ffffff",
    titleColor = "#ffffff",
    subtitleColor = "rgba(255, 255, 255, 0.6)",
    inputBgColor = "rgba(0, 0, 0, 0.2)",
    inputBorderColor = "rgba(255, 255, 255, 0.1)",
    inputFocusBgColor = "rgba(0, 0, 0, 0.3)",
    inputFocusBorderColor = "rgba(255, 255, 255, 0.3)",
    inputTextColor = "#ffffff",
    inputPlaceholderColor = "rgba(255, 255, 255, 0.4)",
    buttonGradientFrom = "rgba(236, 72, 153, 0.8)",
    buttonGradientTo = "rgba(139, 92, 246, 0.8)",
    buttonTextColor = "#ffffff",
    buttonBorderColor = "rgba(255, 255, 255, 0.2)",
    buttonShadowColor = "rgba(236, 72, 153, 0.2)",
    shimmerColor = "rgba(255, 255, 255, 0.05)",
    className = "",
}) => {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: `linear-gradient(to bottom right, ${backgroundGradientFrom}, ${backgroundGradientVia}, ${backgroundGradientTo})`,
            }}
        >
            <div
                className={`absolute top-10 left-10 rounded-full mix-blend-multiply filter blur-${blobBlur} opacity-70 animate-blob`}
                style={{
                    width: blobSize,
                    height: blobSize,
                    backgroundColor: blob1Color,
                }}
            />
            <div
                className={`absolute top-0 right-10 rounded-full mix-blend-multiply filter blur-${blobBlur} opacity-70 animate-blob animation-delay-2000`}
                style={{
                    width: blobSize,
                    height: blobSize,
                    backgroundColor: blob2Color,
                }}
            />
            <div
                className={`absolute -bottom-8 left-20 rounded-full mix-blend-multiply filter blur-${blobBlur} opacity-70 animate-blob animation-delay-4000`}
                style={{
                    width: blobSize,
                    height: blobSize,
                    backgroundColor: blob3Color,
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full backdrop-blur-2xl border p-8 rounded-3xl shadow-2xl relative z-10 ${className}`}
                style={{
                    maxWidth,
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                }}
            >
                <div className="text-center mb-8">
                    <div
                        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: iconBgColor }}
                    >
                        <div style={{ color: iconColor }}>{icon}</div>
                    </div>
                    <h2
                        className="text-2xl font-bold tracking-wide"
                        style={{ color: titleColor }}
                    >
                        {title}
                    </h2>
                    <p
                        className="text-sm mt-2"
                        style={{ color: subtitleColor }}
                    >
                        {subtitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {fields.map((field, i) => (
                        <div key={i} className="relative group">
                            <input
                                type={field.type || "text"}
                                value={formData[field.placeholder] || ""}
                                onChange={(e) => setFormData({ ...formData, [field.placeholder]: e.target.value })}
                                className="w-full border rounded-xl px-4 py-3 focus:outline-none transition-all"
                                style={{
                                    backgroundColor: inputBgColor,
                                    borderColor: inputBorderColor,
                                    color: inputTextColor,
                                }}
                                placeholder={field.placeholder}
                                onFocus={(e) => {
                                    e.currentTarget.style.backgroundColor = inputFocusBgColor;
                                    e.currentTarget.style.borderColor = inputFocusBorderColor;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.backgroundColor = inputBgColor;
                                    e.currentTarget.style.borderColor = inputBorderColor;
                                }}
                            />
                        </div>
                    ))}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 rounded-xl font-semibold shadow-lg transition-all border"
                        style={{
                            background: `linear-gradient(to right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                            color: buttonTextColor,
                            borderColor: buttonBorderColor,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 10px 25px ${buttonShadowColor}`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 10px 15px rgba(0,0,0,0.1)";
                        }}
                    >
                        {buttonText}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};