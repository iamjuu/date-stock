import { NextResponse } from 'next/server';
import { connectToDatabase, isDbConnectionError } from '@/lib/mongodb';
import { Category } from '@/models/category';
import { Product } from '@/models/product';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const productCount = await Product.countDocuments({ category: params.id });
    if (productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category while products are linked to it.' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/categories/[id] failed:', error);
    const message = isDbConnectionError(error)
      ? 'Database unavailable. Start MongoDB or check MONGODB_URI in .env.local'
      : 'Failed to delete category';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
