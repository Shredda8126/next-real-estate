import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/user';
import Property from '@/models/property';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const session = await getServerSession({
      providers: [
        CredentialsProvider({
          name: 'Credentials',
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
          },
          async authorize(credentials) {
            try {
              await connectDB();
              
              if (!credentials?.email || !credentials?.password) {
                return null;
              }
  
              const lowercaseEmail = credentials.email.toLowerCase();
  
              // Find user
              const user = await User.findOne({ email: lowercaseEmail }).select('+password');
              
              if (!user) {
                return null;
              }
  
              // Compare passwords
              const isValid = await bcrypt.compare(
                String(credentials.password),
                String(user.password)
              );
  
              if (!isValid) {
                return null;
              }
  
              // Return user without password
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role
              };
  
            } catch (error) {
              console.error('Auth error:', error.message);
              return null;
            }
          }
        })
      ],
      callbacks: {
        jwt({ token, user }) {
          if (user) {
            token.id = user.id;
            token.role = user.role;
          }
          return token;
        },
        session({ session, token }) {
          session.user.id = token.id;
          session.user.role = token.role;
          return session;
        }
      },
      pages: {
        signIn: '/login',
      },
      session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
