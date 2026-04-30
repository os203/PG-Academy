"use client";

import { motion } from "framer-motion";
import { Feather } from "lucide-react";
import { useState } from "react";

interface ClayFormProps {
    title?: string;
    icon?: React.ReactNode;
    fields?: Array<{ placeholder: string; type?: string }>;
    buttonText?: string;
    onSubmit?: (data: Record<string, string>) => void;
    maxWidth?: string;
    backgroundColor?: string;
    cardBgColor?: string;
    cardShadow?: string;
    iconBgColor?: string;
    iconShadow?: string;
    iconColor?: string;
    titleColor?: string;
    inputBgColor?: string;
    inputTextColor?: string;
    inputPlaceholderColor?: string;
    inputShadow?: string;
    inputFocusShadow?: string;
    buttonBgColor?: string;
    buttonTextColor?: string;
    buttonShadow?: string;
    buttonActiveShadow?: string;
    className?: string;
}

export const ClayForm: React.FC<ClayFormProps> = ({
    title = "Soft Sign In",
    icon = <Feather size={32} />,
    fields = [
        { placeholder: "Username", type: "text" },
        { placeholder: "Password", type: "password" },
    ],
    buttonText = "Enter",
    onSubmit,
    maxWidth = "24rem",
    backgroundColor = "#f0f4f8",
    cardBgColor = "#f0f4f8",
    cardShadow = "inset -12px -12px 20px rgba(255,255,255,1), inset 12px 12px 20px rgba(174,174,192,0.4), 12px 12px 24px rgba(174,174,192,0.2)",
    iconBgColor = "#f0f4f8",
    iconShadow = "inset -6px -6px 10px rgba(255,255,255,1), inset 6px 6px 10px rgba(174,174,192,0.4), 6px 6px 12px rgba(174,174,192,0.3)",
    iconColor = "#60a5fa",
    titleColor = "#64748b",
    inputBgColor = "#f0f4f8",
    inputTextColor = "#475569",
    inputPlaceholderColor = "#94a3b8",
    inputShadow = "inset 6px 6px 10px rgba(174,174,192,0.3), inset -6px -6px 10px rgba(255,255,255,1)",
    inputFocusShadow = "inset 2px 2px 4px rgba(174,174,192,0.4), inset -2px -2px 4px rgba(255,255,255,1)",
    buttonBgColor = "#ebf0f5",
    buttonTextColor = "#3b82f6",
    buttonShadow = "-6px -6px 14px rgba(255,255,255,1), 6px 6px 10px rgba(174,174,192,0.4)",
    buttonActiveShadow = "inset 4px 4px 8px rgba(174,174,192,0.3), inset -4px -4px 8px rgba(255,255,255,1)",
    className = "",
}) => {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4"
            style={{ backgroundColor }}
        >
            <motion.form
                onSubmit={handleSubmit}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`w-full p-8 rounded-[3rem] ${className}`}
                style={{
                    maxWidth,
                    backgroundColor: cardBgColor,
                    boxShadow: cardShadow,
                }}
            >
                <div className="flex justify-center mb-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            backgroundColor: iconBgColor,
                            boxShadow: iconShadow,
                        }}
                    >
                        <div style={{ color: iconColor }}>{icon}</div>
                    </div>
                </div>
                <h2
                    className="text-center text-2xl font-bold mb-8"
                    style={{ color: titleColor }}
                >
                    {title}
                </h2>

                <div className="space-y-6">
                    {fields.map((field, i) => (
                        <div key={i} className="relative">
                            <input
                                type={field.type || "text"}
                                value={formData[field.placeholder] || ""}
                                onChange={(e) => setFormData({ ...formData, [field.placeholder]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full rounded-2xl px-6 py-4 outline-none transition-shadow"
                                style={{
                                    backgroundColor: inputBgColor,
                                    color: inputTextColor,
                                    boxShadow: inputShadow,
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.boxShadow = inputFocusShadow;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.boxShadow = inputShadow;
                                }}
                            />
                        </div>
                    ))}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full font-bold py-4 rounded-2xl transition-all"
                        style={{
                            backgroundColor: buttonBgColor,
                            color: buttonTextColor,
                            boxShadow: buttonShadow,
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.boxShadow = buttonActiveShadow;
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.boxShadow = buttonShadow;
                        }}
                    >
                        {buttonText}
                    </motion.button>
                </div>
            </motion.form>
        </div>
    );
};
