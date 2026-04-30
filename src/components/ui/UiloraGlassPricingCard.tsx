"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface GlassPricingCardProps {
  plan?: string;
  price?: string;
  features?: string[];
  cta?: string;
  className?: string;
}

export const UiloraGlassPricingCard: React.FC<GlassPricingCardProps> = ({
  plan = "Premium Plus",
  price = "$29.99",
  features = ["Unlimited Projects", "AI Asset Generation", "Priority Support", "custom Domain"],
  cta = "Get Started Now",
  className = "",
}) => {
  return (
    <div className={`group relative ${className}`}>
      {/* Animated Background Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative w-80 bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col h-full shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-purple-400">
            <Sparkles size={24} />
          </div>
          <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
            Popular
          </span>
        </div>
        
        <h3 className="text-white text-xl font-bold mb-1 tracking-tight">
          {plan}
        </h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-white text-4xl font-extrabold">{price}</span>
          <span className="text-zinc-500 text-sm font-medium">/mo</span>
        </div>
        
        <div className="flex-grow space-y-4 mb-10">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_purple]" />
              <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">{f}</span>
            </div>
          ))}
        </div>
        
        <button className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all hover:bg-zinc-200 active:scale-95 shadow-xl hover:shadow-white/10">
          {cta}
        </button>
      </div>
    </div>
  );
};

