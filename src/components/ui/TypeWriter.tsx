"use client";

import React, { useState, useEffect } from "react";

interface TypeWriterProps {
  words?: string[];
  typingSpeed?: number;
  className?: string;
}

export const TypeWriter = ({
  words = ["Design.", "Build.", "Ship.", "Scale."],
  typingSpeed = 80,
  className = "",
}: TypeWriterProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const targetWord = words[currentWordIndex];

    const interval = setInterval(() => {
      if (!isDeleting) {
        if (currentText.length < targetWord.length) {
          setCurrentText(targetWord.slice(0, currentText.length + 1));
        } else {
          clearInterval(interval);
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 1800);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? typingSpeed * 0.5 : typingSpeed);

    return () => clearInterval(interval);
  }, [currentText, isDeleting, isPaused, currentWordIndex, words, typingSpeed]);

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center bg-zinc-950 ${className}`}>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .tw-cursor {
          animation: blink 1s step-end infinite;
        }
      `}</style>

      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-600 font-medium mb-4">
          We do one thing
        </p>
        <div className="flex flex-wrap items-baseline justify-center gap-x-4">
          <span className="text-6xl md:text-8xl font-black tracking-tight text-zinc-400 select-none">
            We
          </span>
          <span className="text-6xl md:text-8xl font-black tracking-tight text-white">
            {currentText}
            <span className="tw-cursor text-zinc-400 ml-0.5">|</span>
          </span>
        </div>
        <div className="mt-8 flex gap-2">
          {words.map((_, i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === currentWordIndex ? "#fff" : "#3f3f46",
                transform: i === currentWordIndex ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
