import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/50 mt-auto backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="PG Academy" width={140} height={35} className="object-contain rounded-sm" />
          </div>
          <p className="text-foreground/50 text-sm font-medium">
            © {new Date().getFullYear()} Zarqa University - Software Engineering.
          </p>
          <div className="flex gap-6 text-sm font-medium text-foreground/60">
            <span className="hover:text-brand-accent cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-brand-accent cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
