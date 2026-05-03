
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "PG Academy | Premium LMS",
    description: "A unique AI Learning Management System designed explicitly for Arab markets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {



    return (
        <html lang="en" className={cn("h-full", "antialiased", outfit.variable, "font-sans", geist.variable)} suppressHydrationWarning>
            <body className="min-h-full flex flex-col selection:bg-brand-accent selection:text-white transition-colors duration-300">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <TooltipProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}