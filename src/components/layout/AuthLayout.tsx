
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (

        <div className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 transition-colors duration-300">

            <Navbar />
            <main className="grow flex flex-col pt-24 pb-12">
                {children}
            </main>
            <Footer />
        </div>

    );
}
