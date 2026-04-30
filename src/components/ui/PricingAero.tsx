"use client";

import React from "react";
import { Check } from "lucide-react";

interface PricingPlan {
    name: string;
    price: number;
    description?: string;
}

interface PricingAeroProps {
    plans?: PricingPlan[];
    features?: string[];
    backgroundColor?: string;
    backgroundImage?: string;
    cardBgColor?: string;
    cardBorderColor?: string;
    cardBlurColor?: string;
    titleColor?: string;
    descriptionColor?: string;
    priceColor?: string;
    featureTextColor?: string;
    buttonBgColor?: string;
    buttonTextColor?: string;
    buttonBorderColor?: string;
    buttonText?: string;
}

const PricingAero: React.FC<PricingAeroProps> = ({
    plans = [
        { name: "Lite", price: 30, description: "Experience clarity." },
        { name: "Pro", price: 60, description: "Experience clarity." },
        { name: "Max", price: 90, description: "Experience clarity." },
    ],
    features = ["Unlimited Projects", "Analytics Dashboard", "24/7 Support", "Custom Domain", "API Access"],
    backgroundColor = "#000000",
    backgroundImage = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop",
    cardBgColor = "rgba(255,255,255,0.1)",
    cardBorderColor = "rgba(255,255,255,0.4)",
    cardBlurColor = "rgba(255,255,255,0.2)",
    titleColor = "#ffffff",
    descriptionColor = "rgba(255,255,255,0.8)",
    priceColor = "#ffffff",
    featureTextColor = "rgba(255,255,255,0.9)",
    buttonBgColor = "rgba(255,255,255,0.2)",
    buttonTextColor = "#ffffff",
    buttonBorderColor = "rgba(255,255,255,0.4)",
    buttonText = "Purchase",
}) => {
    return (
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" style={{ backgroundColor, backgroundImage: `url(${backgroundImage})` }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                {plans.map((plan, i) => (
                    <div key={plan.name} className="relative group">
                        <div className="absolute inset-0 blur-xl rounded-[30px]" style={{ backgroundColor: cardBlurColor }} />
                        <div className="relative h-full backdrop-blur-2xl border rounded-[30px] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex flex-col overflow-hidden transition-transform hover:-translate-y-2" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-b rotate-45 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${cardBlurColor}, transparent)` }} />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-medium mb-1 drop-shadow-md" style={{ color: titleColor }}>{plan.name}</h3>
                                <div className="text-sm mb-6" style={{ color: descriptionColor }}>{plan.description}</div>
                                <div className="text-6xl font-thin mb-8 tracking-tighter" style={{ color: priceColor }}>
                                    ${plan.price}
                                </div>
                                <div className="space-y-4 mb-8">
                                    {features.map((f) => (
                                        <div key={f} className="flex items-center gap-3 font-medium text-sm" style={{ color: featureTextColor }}>
                                            <div className="p-1 rounded-full" style={{ backgroundColor: cardBlurColor }}><Check size={12} /></div>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-4 rounded-xl hover:opacity-90 border font-semibold shadow-inner transition-colors" style={{ backgroundColor: buttonBgColor, color: buttonTextColor, borderColor: buttonBorderColor }}>
                                    {buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingAero;

