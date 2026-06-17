import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-md text-center">
        <h2 className="text-4xl font-bold text-brand-600">404</h2>
        <p className="mt-2 text-lg font-semibold text-slate-900">Page not found</p>
        <p className="mt-1 text-sm text-slate-500">The page you are looking for does not exist.</p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
