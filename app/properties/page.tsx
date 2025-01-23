import { Suspense } from 'react';
import PropertiesClient from './PropertiesClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
  const session = await getServerSession(authOptions);
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
