import { NextResponse } from 'next/server';
import { connectToDatabase, isDbConnectionError } from '@/lib/mongodb';
import '@/models/category';
import { Product } from '@/models/product';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const product = await Product.findById(params.id).populate('category');
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    const message = isDbConnectionError(error) ? 'Database unavailable' : 'Failed to load product';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await request.json();

    const payload = {
      name: data.name,
      category: data.category,
      purchasePrice: Number(data.purchasePrice),
      sellingPrice: Number(data.sellingPrice),
      quantity: Number(data.quantity),
    };

    if (!payload.name || !payload.category) {
      return NextResponse.json({ error: 'Product name and category are required.' }, { status: 400 });
    }

    if (
      !Number.isFinite(payload.purchasePrice) ||
      !Number.isFinite(payload.sellingPrice) ||
      !Number.isFinite(payload.quantity) ||
      payload.purchasePrice < 0 ||
      payload.sellingPrice < 0 ||
      payload.quantity < 0
    ) {
      return NextResponse.json({ error: 'Product prices and stock must be valid numbers.' }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(params.id, payload, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT /api/products/[id] failed:', error);
    const message = isDbConnectionError(error) ? 'Database unavailable' : 'Failed to update product';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const quantityToAdd = Number(data.quantityToAdd);
    const purchasePrice = data.purchasePrice === undefined || data.purchasePrice === ''
      ? undefined
      : Number(data.purchasePrice);

    if (!Number.isFinite(quantityToAdd) || quantityToAdd <= 0) {
      return NextResponse.json({ error: 'Enter a valid purchase quantity.' }, { status: 400 });
    }

    if (purchasePrice !== undefined && (!Number.isFinite(purchasePrice) || purchasePrice < 0)) {
      return NextResponse.json({ error: 'Enter a valid purchase price.' }, { status: 400 });
    }

    const update: Record<string, unknown> = {
      $inc: { quantity: quantityToAdd },
    };

    if (purchasePrice !== undefined) {
      update.$set = { purchasePrice };
    }

    const product = await Product.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('PATCH /api/products/[id] failed:', error);
    const message = isDbConnectionError(error) ? 'Database unavailable' : 'Failed to update stock';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    const message = isDbConnectionError(error) ? 'Database unavailable' : 'Failed to delete product';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
