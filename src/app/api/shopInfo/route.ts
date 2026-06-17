import { NextResponse } from 'next/server';
import { connectToDatabase, isDbConnectionError } from '@/lib/mongodb';
import { ShopInfo } from '@/models/shopInfo';

const defaultShop = { name: 'My Shop', contactNumber: '' };

export async function GET() {
  try {
    await connectToDatabase();
    let shop = await ShopInfo.findOne({});
    if (!shop) {
      shop = await ShopInfo.create(defaultShop);
    }
    return NextResponse.json(shop);
  } catch (error) {
    console.error('GET /api/shopInfo failed:', error);
    const message = isDbConnectionError(error)
      ? 'Database unavailable. Using default shop info until MongoDB is connected.'
      : 'Failed to load shop info';
    return NextResponse.json({ ...defaultShop, error: message }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const shop = await ShopInfo.findOneAndUpdate(
      {},
      {
        name: data.name,
        contactNumber: data.contactNumber ?? '',
      },
      { new: true, upsert: true, runValidators: true }
    );
    return NextResponse.json(shop);
  } catch (error) {
    console.error('PUT /api/shopInfo failed:', error);
    const message = isDbConnectionError(error)
      ? 'Database unavailable. Start MongoDB or check MONGODB_URI in .env.local'
      : 'Failed to save shop info';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
