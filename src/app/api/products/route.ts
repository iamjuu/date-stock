import { NextResponse } from 'next/server';
import { connectToDatabase, isDbConnectionError } from '@/lib/mongodb';
import '@/models/category';
import { Product } from '@/models/product';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const query: Record<string, unknown> = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error('GET /api/products failed:', error);
    const message = isDbConnectionError(error)
      ? 'Database unavailable. Start MongoDB or check MONGODB_URI in .env.local'
      : 'Failed to load products';
    return NextResponse.json({ error: message, products: [], total: 0, page: 1, limit: 10 }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const product = await Product.create(data);
    return NextResponse.json(product);
  } catch (error) {
    console.error('POST /api/products failed:', error);
    const message = isDbConnectionError(error)
      ? 'Database unavailable. Start MongoDB or check MONGODB_URI in .env.local'
      : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
