import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-1 items-center justify-center bg-gray-50/50 dark:bg-slate-950 text-foreground px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs for visual flair in both modes */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-2xl rounded-3xl border border-border/50 bg-white/80 dark:bg-slate-900/80 p-10 shadow-2xl backdrop-blur-xl relative z-10 hover-lift">
        <div className="text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-brand-accent font-semibold">Access Denied</p>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Unauthorized</h1>
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            You do not have permission to access this page. If you believe this is an error, please make sure you are logged in with the correct account or contact an administrator.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-brand-primary text-white px-6 py-3 text-sm font-semibold transition hover:opacity-90 shadow-lg"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-gray-100/50 dark:bg-white/5 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-gray-200/50 dark:hover:bg-white/10"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
