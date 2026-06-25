'use client';

import { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface Product {
  _id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  category?: { name: string };
}

interface BillItem extends Product {
  qty: number;
  lineTotal: number;
}

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [shop, setShop] = useState<{ name: string; contactNumber: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productsRes = await fetch('/api/products?page=1&limit=1000');
      const productsData = await productsRes.json().catch(() => null);
      if (productsData?.error) setDbError(productsData.error);
      setProducts(productsData?.products ?? []);

      const shopRes = await fetch('/api/shopInfo');
      const shopData = await shopRes.json().catch(() => null);
      if (shopData?.error) setDbError(shopData.error);
      setShop(shopData ? { name: shopData.name ?? 'My Shop', contactNumber: shopData.contactNumber ?? '' } : null);
    } catch {
      setDbError('Could not load billing data. Check that MongoDB is running.');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (product: Product) => {
    const existing = items.find((i) => i._id === product._id);
    if (existing) {
      setItems(
        items.map((i) =>
          i._id === product._id
            ? { ...i, qty: i.qty + 1, lineTotal: i.sellingPrice * (i.qty + 1) }
            : i
        )
      );
    } else {
      setItems([...items, { ...product, qty: 1, lineTotal: product.sellingPrice }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setItems(items.map((i) => (i._id === id ? { ...i, qty, lineTotal: i.sellingPrice * qty } : i)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i._id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalDiscount = discountType === 'percentage' ? subtotal * (discount / 100) : discount;
  const total = Math.max(0, subtotal - totalDiscount);
  const totalCost = items.reduce((sum, i) => sum + i.purchasePrice * i.qty, 0);
  const profit = total - totalCost;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await pdf(<BillDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'bill.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const blob = await pdf(<BillDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');

      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        URL.revokeObjectURL(url);
        setPrinting(false);
      };
    } catch {
      setPrinting(false);
    }
  };

  const BillDocument = () => (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.shopName}>{shop?.name || 'Shop Name'}</Text>
            <Text style={styles.contact}>{shop?.contactNumber || 'Contact: 0000000000'}</Text>
          </View>
          <View style={styles.billMeta}>
            <Text style={styles.metaText}>Date</Text>
            <Text style={styles.metaValue}>{new Date().toLocaleDateString()}</Text>
            <Text style={styles.metaText}>Items</Text>
            <Text style={styles.metaValue}>{items.length}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadText, { flex: 3 }]}>Product</Text>
            <Text style={[styles.tableHeadText, { flex: 1 }]}>Qty</Text>
            <Text style={[styles.tableHeadText, { flex: 2 }]}>Rate</Text>
            <Text style={[styles.tableHeadText, { flex: 2, textAlign: 'right' }]}>Amount</Text>
          </View>
          {items.map((item) => (
            <View key={item._id} style={styles.tableRow}>
              <Text style={[styles.col, { flex: 3 }]}>{item.name}</Text>
              <Text style={[styles.col, { flex: 1 }]}>{item.qty}</Text>
              <Text style={[styles.col, { flex: 2 }]}>${item.sellingPrice.toFixed(2)}</Text>
              <Text style={[styles.col, { flex: 2, textAlign: 'right' }]}>${item.lineTotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Discount ({discountType === 'percentage' ? `${discount}%` : '$'})
            </Text>
            <Text style={styles.summaryValue}>-${totalDiscount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Profit</Text>
            <Text style={styles.summaryValue}>${profit.toFixed(2)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your purchase!</Text>
        </View>
      </Page>
    </Document>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading billing data...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Bill</h1>
        <p className="mt-1 text-sm text-slate-500">Add products and generate a PDF invoice</p>
      </div>

      {dbError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {dbError}
        </div>
      )}

      <div className="card mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-700">Add Product</label>
        <select
          onChange={(e) => {
            const id = e.target.value;
            const product = products.find((p) => p._id === id);
            if (product) addItem(product);
            e.target.value = '';
          }}
          className="input-field max-w-md"
          defaultValue=""
        >
          <option value="" disabled>
            Select a product...
          </option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} - ${p.sellingPrice}
            </option>
          ))}
        </select>
      </div>

      <div className="card mb-6 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Qty</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateQty(item._id, parseInt(e.target.value))}
                        className="input-field w-20 py-1.5"
                        min={1}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">${item.sellingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">${item.lineTotal.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeItem(item._id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Discount</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="input-field w-28"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'amount' | 'percentage')}
              className="input-field w-28"
            >
              <option value="amount">$ Amount</option>
              <option value="percentage">% Percent</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd>${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Discount</dt>
              <dd>-${totalDiscount.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Cost</dt>
              <dd>${totalCost.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Profit</dt>
              <dd className={profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                ${profit.toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
              <dt>Total</dt>
              <dd>${total.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary inline-flex px-6 py-3 no-underline"
        >
          {downloading ? 'Preparing PDF...' : 'Download PDF Bill'}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          disabled={printing}
          className="btn-primary inline-flex px-6 py-3"
        >
          {printing ? 'Preparing Print...' : 'Print Bill'}
        </button>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  page: { size: 'A4', padding: 42, backgroundColor: '#f8fafc', color: '#0f172a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 18,
    marginBottom: 24,
  },
  invoiceLabel: { fontSize: 10, color: '#4f46e5', letterSpacing: 1.5, marginBottom: 8 },
  shopName: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  contact: { fontSize: 10, color: '#64748b', marginTop: 5 },
  billMeta: { alignItems: 'flex-end' },
  metaText: { fontSize: 9, color: '#64748b', marginTop: 2 },
  metaValue: { fontSize: 11, color: '#111827', marginBottom: 8 },
  table: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  tableHeader: { flexDirection: 'row', backgroundColor: '#eef2ff', paddingVertical: 10, paddingHorizontal: 12 },
  tableHeadText: { fontSize: 10, fontWeight: 'bold', color: '#3730a3' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  col: { fontSize: 10, color: '#334155' },
  summary: {
    width: 220,
    alignSelf: 'flex-end',
    marginTop: 24,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 10, color: '#64748b' },
  summaryValue: { fontSize: 10, color: '#0f172a' },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: '#4f46e5' },
  footer: { marginTop: 34, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 14 },
  footerText: { fontSize: 10, color: '#64748b' },
});
