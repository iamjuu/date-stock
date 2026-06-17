'use client';

import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  category?: { _id: string; name: string };
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [dbError, setDbError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [purchaseSaved, setPurchaseSaved] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
  });
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    quantityToAdd: '',
    purchasePrice: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
    fetchProductOptions();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setDbError('');
    try {
      const res = await fetch(`/api/products?page=${page}&limit=10&search=${search}`);
      const data = await res.json().catch(() => null);
      if (!data) {
        setDbError('Could not load products.');
        setProducts([]);
        setTotalPages(1);
        return;
      }
      if (data.error) setDbError(data.error);
      setProducts(data.products ?? []);
      setTotalPages(Math.max(1, Math.ceil((data.total ?? 0) / 10)));
    } catch (err) {
      console.error(err);
      setDbError('Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json().catch(() => null);
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        if (data?.error) setDbError(data.error);
        setCategories(data?.categories ?? []);
      }
    } catch (err) {
      console.error(err);
      setDbError('Could not load categories.');
    }
  };

  const fetchProductOptions = async () => {
    try {
      const res = await fetch('/api/products?page=1&limit=1000');
      const data = await res.json().catch(() => null);
      if (data?.error) setDbError(data.error);
      setProductOptions(data?.products ?? []);
    } catch (err) {
      console.error(err);
      setDbError('Could not load product options.');
    }
  };

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePurchaseInputChange = (field: keyof typeof purchaseForm, value: string) => {
    setPurchaseForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetProductForm = () => {
    setForm({
      name: '',
      category: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
    });
    setEditingProductId(null);
  };

  const startEdit = (product: Product) => {
    setDbError('');
    setSavedMessage('');
    setEditingProductId(product._id);
    setForm({
      name: product.name,
      category: product.category?._id ?? '',
      purchasePrice: String(product.purchasePrice),
      sellingPrice: String(product.sellingPrice),
      quantity: String(product.quantity),
    });
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbError('');
    setSavedMessage('');

    if (!form.name || !form.category || !form.purchasePrice || !form.sellingPrice) {
      setDbError('Enter product name, category, purchase price, and selling price.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantity: Number(form.quantity || 0),
    };

    if (
      Number.isNaN(payload.purchasePrice) ||
      Number.isNaN(payload.sellingPrice) ||
      Number.isNaN(payload.quantity)
    ) {
      setDbError('Product prices and stock must be valid numbers.');
      return;
    }

    const res = await fetch(editingProductId ? `/api/products/${editingProductId}` : '/api/products', {
      method: editingProductId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setDbError(data?.error || (editingProductId ? 'Failed to update product.' : 'Failed to add product.'));
      return;
    }

    const message = editingProductId ? 'Product updated' : 'Product added';
    resetProductForm();
    setSavedMessage(message);
    setPage(1);
    fetchProducts();
    fetchProductOptions();
  };

  const addPurchaseEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbError('');
    setPurchaseSaved(false);

    if (!purchaseForm.productId || !purchaseForm.quantityToAdd) {
      setDbError('Select a product and enter purchase quantity.');
      return;
    }

    const quantityToAdd = Number(purchaseForm.quantityToAdd);
    const purchasePrice = purchaseForm.purchasePrice === '' ? undefined : Number(purchaseForm.purchasePrice);

    if (!Number.isFinite(quantityToAdd) || quantityToAdd <= 0) {
      setDbError('Purchase quantity must be greater than zero.');
      return;
    }

    if (purchasePrice !== undefined && (!Number.isFinite(purchasePrice) || purchasePrice < 0)) {
      setDbError('Purchase price must be a valid number.');
      return;
    }

    const res = await fetch(`/api/products/${purchaseForm.productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantityToAdd, purchasePrice }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setDbError(data?.error || 'Failed to add purchase entry.');
      return;
    }

    setPurchaseForm({ productId: '', quantityToAdd: '', purchasePrice: '' });
    setPurchaseSaved(true);
    fetchProducts();
    fetchProductOptions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
    fetchProductOptions();
    if (editingProductId === id) resetProductForm();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage inventory and pricing</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-xs"
          />
          <button onClick={() => setPage(1)} className="btn-secondary">
            Search
          </button>
        </div>
      </div>

      {dbError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {dbError}
        </div>
      )}

      <div className="card mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            {editingProductId ? 'Edit Product' : 'Add Product'}
          </h2>
          {savedMessage && <span className="text-sm font-medium text-emerald-600">{savedMessage}</span>}
        </div>
        <form onSubmit={addProduct} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="input-field"
              disabled={categories.length === 0}
            >
              <option value="">
                {categories.length === 0 ? 'Add a category first' : 'Select category'}
              </option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Purchase Price</label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              className="input-field"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Selling Price</label>
            <input
              type="number"
              value={form.sellingPrice}
              onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
              className="input-field"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Stock</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="input-field"
              min="0"
              step="1"
              placeholder="0"
            />
          </div>
          <div className="flex items-end gap-3 xl:col-span-4">
            <button type="submit" className="btn-primary" disabled={categories.length === 0}>
              {editingProductId ? 'Update Product' : 'Add Product'}
            </button>
            {editingProductId && (
              <button type="button" onClick={resetProductForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Purchase Entry</h2>
          {purchaseSaved && <span className="text-sm font-medium text-emerald-600">Stock updated</span>}
        </div>
        <form onSubmit={addPurchaseEntry} className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Product</label>
            <select
              value={purchaseForm.productId}
              onChange={(e) => handlePurchaseInputChange('productId', e.target.value)}
              className="input-field"
              disabled={productOptions.length === 0}
            >
              <option value="">
                {productOptions.length === 0 ? 'Add a product first' : 'Select product'}
              </option>
              {productOptions.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - current stock {product.quantity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Quantity Added</label>
            <input
              type="number"
              value={purchaseForm.quantityToAdd}
              onChange={(e) => handlePurchaseInputChange('quantityToAdd', e.target.value)}
              className="input-field"
              min="1"
              step="1"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Purchase Price</label>
            <input
              type="number"
              value={purchaseForm.purchasePrice}
              onChange={(e) => handlePurchaseInputChange('purchasePrice', e.target.value)}
              className="input-field"
              min="0"
              step="0.01"
              placeholder="Keep current"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary" disabled={productOptions.length === 0}>
              Add Stock
            </button>
          </div>
        </form>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Purchase</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Selling</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600">{p.category?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600">${p.purchasePrice}</td>
                      <td className="px-4 py-3 text-slate-600">${p.sellingPrice}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {p.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(p)}
                            className="btn-secondary px-3 py-1.5 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="btn-secondary"
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
}
