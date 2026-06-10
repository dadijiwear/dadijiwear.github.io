import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Offer from '@/models/Offer';

export async function GET() {
  try {
    await dbConnect();
    const offers = await Offer.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json({ success: true, data: offers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const offer = await Offer.create(body);
    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
