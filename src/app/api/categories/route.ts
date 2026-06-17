import { NextResponse } from 'next/server';
import { connectToDatabase, isDbConnectionError } from '@/lib/mongodb';
import { Category } from '@/models/category';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/categories failed:', error);
    const message = isDbConnectionError(error)
      ? 'Database unavailable. Start MongoDB or check MONGODB_URI in .env.local'
      : 'Failed to load categories';
    return NextResponse.json({ error: message, categories: [] }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const category = await Category.create(data);
    return NextResponse.json(category);
  } catch (error) {
    console.error('POST /api/categories failed:', error);
    const message = isDbConnectionError(error)
      ? 'Database unavailable. Start MongoDB or check MONGODB_URI in .env.local'
      : 'Failed to create category';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
