'use client';

import { useEffect, useState } from 'react';

export default function ShopInfoForm() {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/shopInfo')
      .then((res) => res.text())
      .then((text) => {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then((data) => {
        if (!data) {
          setError('Could not load shop info.');
          return;
        }
        if (data.error) setError(data.error);
        setName(data.name ?? '');
        setContactNumber(data.contactNumber ?? '');
      })
      .catch(() => setError('Could not load shop info.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/shopInfo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contactNumber }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data?.error || 'Failed to update shop info');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading shop info...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Shop Information</h2>
      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Shop Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="My Shop"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Contact Number</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="input-field"
            placeholder="+1 234 567 8900"
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Shop Info'}
          </button>
          {saved && <span className="text-sm font-medium text-emerald-600">Saved!</span>}
        </div>
      </div>
    </form>
  );
}
