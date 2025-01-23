import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Property from '@/models/property';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const listings = await Property.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Convert _id to string and format dates
    const formattedListings = listings.map(listing => ({
      ...listing,
      _id: listing._id.toString(),
      createdAt: listing.createdAt?.toISOString(),
      userId: listing.userId.toString()
    }));

    return NextResponse.json(formattedListings, { status: 200 });
  } catch (error) {
    console.error('Error fetching my listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
