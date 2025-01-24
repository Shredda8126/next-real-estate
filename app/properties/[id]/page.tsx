import { Suspense } from "react";
import PropertyDetailsClient from "./PropertyDetailsClient";
import connectDB from "@/lib/db";
import Property from "@/models/property";
import User from "@/models/user";
import { Metadata } from 'next';
import { verifyToken } from "@/lib/jwt";
import { formatCurrency } from '@/lib/currencyFormat';
import { IProperty, PropertyCreateInput } from "@/types/property";
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

export default async function PropertyDetailsPage({
  params,
}: {
  params: Params;
}): Promise<JSX.Element> {
  try {
    const property = await getPropertyWithEnquiries(params.id);
    console.log("Property Data:", property);

    return (
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8 text-center">
            Loading property details...
          </div>
        }
      >
        <PropertyDetailsClient
          initialProperty={{
            ...property,
            price: property.price.toString(),
          }}
        />
      </Suspense>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Unable to load property details. {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const property = await getPropertyWithEnquiries(params.id);
    return {
      title: property ? `${property.title} - Property Details` : 'Property Details',
      description: property ? property.description : 'Property details not available'
    };
  } catch (error) {
    return {
      title: 'Property Not Found',
      description: 'Unable to retrieve property details'
    };
  }
}

async function getPropertyWithEnquiries(id: string): Promise<IProperty> {
  try {
    await connectDB();

    const property = await Property.findById(id).lean() as Omit<Partial<IProperty>, '_id'> & { _id: string };

    if (!property) {
      throw new Error("Property not found");
    }

    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
}
