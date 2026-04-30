
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (

        <div className="min-h-full flex flex-col selection:bg-brand-accent selection:text-white transition-colors duration-300">

            <Navbar />
            <main className="flex-grow pt-20 flex flex-col">
                {children}
            </main>
            <Footer />
        </div>

    );
}
