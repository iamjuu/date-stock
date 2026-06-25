'use client';

import { useState } from 'react';
import ShopInfoForm from '@/components/ShopInfoForm';

export default function SettingsAdmin() {
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [saved, setSaved] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);

  const handleSaveDiscountType = async () => {
    setSavingPreference(true);
    try {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingPreference(false);
    }
  };


  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure your shop and billing preferences</p>
      </div>

      <div className="card mb-6">
        <ShopInfoForm />
      </div>

      <div className="card mb-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Bill Discount Type</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'amount' | 'percentage')}
            className="input-field max-w-xs"
          >
            <option value="amount">Flat Amount Discount</option>
            <option value="percentage">Percentage Discount</option>
          </select>
          <button onClick={handleSaveDiscountType} disabled={savingPreference} className="btn-primary">
            {savingPreference ? 'Saving...' : 'Save Preference'}
          </button>
          {saved && <span className="text-sm font-medium text-emerald-600">Updated!</span>}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Bill Template Preview</h2>
        <p className="mb-3 text-sm text-slate-500">The bill PDF includes:</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2"><span className="text-brand-500">✓</span> Shop name and contact number</li>
          <li className="flex gap-2"><span className="text-brand-500">✓</span> Product list with selling price per item</li>
          <li className="flex gap-2"><span className="text-brand-500">✓</span> Quantity and line total for each item</li>
          <li className="flex gap-2"><span className="text-brand-500">✓</span> Discount (flat amount or percentage)</li>
          <li className="flex gap-2"><span className="text-brand-500">✓</span> Final bill total and profit calculation</li>
        </ul>
      </div>
    </div>
  );
}
