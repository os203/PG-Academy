
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import CanvasParticles from "@/components/ui/CanvasParticles";
import type { Metadata } from "next";
import { Outfit, Cairo } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

const cairo = Cairo({
    variable: "--font-cairo",
    subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
    title: "PG Academy | AI Academy for Creative Careers",
    description: "Elevate your skills with AI-powered learning — designed for the modern Arab professional. PG Academy by University of Zarqa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" dir="ltr" className={cn("h-full", "antialiased", outfit.variable, cairo.variable, "font-sans")} suppressHydrationWarning>
            <body className="min-h-full flex flex-col selection:bg-[#bd9759] selection:text-white transition-colors duration-300 text-zinc-100">
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <TooltipProvider>
                        <LanguageProvider>
                            <ClerkProvider>
                                <AuthProvider>
                                    <div className="relative z-10 flex flex-col min-h-screen">
                                        <CanvasParticles />
                                        {children}
                                    </div>
                                </AuthProvider>
                            </ClerkProvider>
                        </LanguageProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}