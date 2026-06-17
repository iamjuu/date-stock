'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_PASSWORD, DEFAULT_USERNAME } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError('Invalid username or password');
        return;
      }

      const from = searchParams.get('from') || '/dashboard';
      router.push(from);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
              B
            </div>
            <span className="text-xl font-semibold tracking-tight">BillFlow</span>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Simple billing for your shop
          </h1>
          <p className="mt-4 max-w-md text-lg text-indigo-100">
            Manage products, create bills, and track profits — all in one clean dashboard.
          </p>
        </div>

        <p className="text-sm text-indigo-200">&copy; {new Date().getFullYear()} BillFlow</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                B
              </div>
              <span className="text-lg font-semibold">BillFlow</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">Sign in to access your billing dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Default login</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <span>
                <span className="text-slate-500">Username:</span>{' '}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-brand-700">{DEFAULT_USERNAME}</code>
              </span>
              <span>
                <span className="text-slate-500">Password:</span>{' '}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-brand-700">{DEFAULT_PASSWORD}</code>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
