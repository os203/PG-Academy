import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout'

export default function Home() {
  return (
    <>
      <AuthLayout>

        <div className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-brand-accent/30 text-sm font-medium text-brand-accent">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              The Arab-First AI Learning Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground max-w-4xl">
              Master Your Future with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary">
                Intelligent Learning
              </span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mb-12 leading-relaxed">
              Unlock your potential with PG Academy. Enjoy secure, culturally-tailored courses powered by AI, and earn verified credentials on your schedule.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
              <Link href="/courses" className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-full font-semibold text-lg transition-all hover-lift shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2">
                Explore Courses
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/about" className="w-full sm:w-auto px-8 py-4 glass border border-white/10 hover:border-brand-accent/50 text-foreground rounded-full font-semibold text-lg transition-all hover-lift flex items-center justify-center">
                Learn More
              </Link>
            </div>

            {/* Feature stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 w-full max-w-4xl mx-auto border-t border-white/5 pt-12">
              {[
                { value: "AI", label: "Smart Assistant" },
                { value: "100%", label: "Data Sovereignty" },
                { value: "HLS", label: "Secure Streaming" },
                { value: "QR", label: "Verified Certificates" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-primary mb-2">
                    {stat.value}
                  </span>
                  <span className="text-sm text-foreground/60 font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
