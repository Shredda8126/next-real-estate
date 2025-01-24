import { Suspense } from 'react';
import PropertiesClient from './PropertiesClient';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import Property from '@/models/property';

async function fetchProperties() {
  try {
    await connectDB();
    const properties = await Property.find().limit(9).lean();
    return properties.map(prop => ({
      ...prop,
      _id: prop._id.toString(),
      createdAt: prop.createdAt?.toISOString(),
      updatedAt: prop.updatedAt?.toISOString()
    }));
  } catch (error) {
    console.error('Server-side properties fetch error:', error);
    return [];
  }
}

export default async function PropertiesPage() {
  const session = await getServerSession({
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          // Existing authorization logic
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

  const initialProperties = await fetchProperties();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesClient 
        initialProperties={initialProperties} 
        isAuthenticated={!!session}
      />
    </Suspense>
  );
}
