import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-7xl font-bold text-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-foreground/80 mb-6">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Oops! We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or you typed the URL incorrectly.
      </p>
      <Link 
        href="/dashboard" 
        className="bg-brand-primary hover:bg-brand-hover text-white px-8 py-3 rounded-lg font-medium transition-colors hover-lift"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
