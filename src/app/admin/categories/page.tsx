'use client';

import { useEffect, useState } from 'react';

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setDbError('');
    try {
      const res = await fetch('/api/categories');
      const data = await res.json().catch(() => null);
      if (!data) {
        setDbError('Could not load categories.');
        setCategories([]);
        return;
      }
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        if (data.error) setDbError(data.error);
        setCategories(data.categories ?? []);
      }
    } catch (err) {
      console.error(err);
      setDbError('Could not load categories.');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setDbError('');

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setDbError(data?.error || 'Failed to add category');
      return;
    }
    setName('');
    fetchCategories();
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    setDbError('');

    const res = await fetch(`/api/categories/${category._id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setDbError(data?.error || 'Failed to delete category');
      return;
    }

    fetchCategories();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">Organize your products</p>
      </div>

      {dbError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {dbError}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Add Category</h2>
        <form onSubmit={addCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary shrink-0">
            Add
          </button>
        </form>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading categories...</p>
        ) : categories.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50/50"
              >
                <div className="flex min-w-0 items-center">
                  <span className="mr-3 text-brand-500">-</span>
                  <span className="truncate font-medium text-slate-900">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-slate-500">No categories yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
