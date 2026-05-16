
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";




export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="grow flex flex-col">
        {children}
      </main>
      <Footer />
    </>

  );
}
