'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DEFAULT_USERNAME } from '@/lib/auth';

interface Product {
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
}

const quickActions = [
  {
    href: '/billing',
    title: 'Create Bill',
    description: 'Generate a new invoice and download PDF',
    color: 'bg-brand-50 text-brand-700 border-brand-100',
    icon: '⎘',
  },
  {
    href: '/admin/products',
    title: 'Manage Products',
    description: 'Add, edit, and track inventory',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: '▣',
  },
  {
    href: '/admin/categories',
    title: 'Categories',
    description: 'Organize products by category',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    icon: '☰',
  },
  {
    href: '/admin/settings',
    title: 'Shop Settings',
    description: 'Update shop name and bill preferences',
    color: 'bg-violet-50 text-violet-700 border-violet-100',
    icon: '⚙',
  },
];

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('/api/products?page=1&limit=1000');
      const data = await res.json().catch(() => null);
      setProducts(data?.products ?? []);
    };

    fetchProducts();
  }, []);

  const inventoryProfit = products.reduce(
    (sum, product) => sum + (product.sellingPrice - product.purchasePrice) * product.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">Dashboard</h1>
        <p className="mt-1 text-slate-500">Welcome back. Here&apos;s an overview of your billing app.</p>
      </div>

      {/* Profile */}
      <div className="card mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
              A
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Admin Profile</h2>
              <p className="mt-1 text-sm text-slate-500">{DEFAULT_USERNAME}</p>
            </div>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Role</p>
              <p className="mt-1 font-semibold text-slate-900">Administrator</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Access</p>
              <p className="mt-1 font-semibold text-slate-900">Full Control</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
              <p className="mt-1 font-semibold text-emerald-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Quick Action', value: 'New Bill', sub: 'Start billing now' },
          { label: 'Products', value: 'Manage', sub: 'Inventory & pricing' },
          { label: 'Categories', value: 'Organize', sub: 'Group your items' },
          {
            label: 'Profit',
            value: `$${inventoryProfit.toFixed(2)}`,
            sub: 'Estimated inventory profit',
          },
          { label: 'Settings', value: 'Configure', sub: 'Shop info & bills' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex items-start gap-4 rounded-2xl border p-5 transition hover:shadow-card ${action.color}`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 text-xl shadow-sm">
              {action.icon}
            </span>
            <div>
              <h3 className="font-semibold group-hover:underline">{action.title}</h3>
              <p className="mt-1 text-sm opacity-80">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Getting started */}
      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Getting Started</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</span>
            Set up your shop name and contact in Settings
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</span>
            Add categories and products with prices
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</span>
            Create bills and download PDF invoices
          </li>
        </ol>
      </div>
    </div>
  );
}
