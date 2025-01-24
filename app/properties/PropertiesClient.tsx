"use client";

import { useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { useRouter, useSearchParams } from "next/navigation";
import { FaHome, FaMapMarkerAlt, FaMoneyBillWave, FaBuilding, FaSearch, FaSort, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { IProperty } from "@/types/property";

const ITEMS_PER_PAGE = 9;
const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
];

interface PropertiesClientProps {
  initialProperties: IProperty[];
  isAuthenticated: boolean;
}

export default function PropertiesClient({ 
  initialProperties, 
  isAuthenticated 
}: PropertiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<IProperty[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard 
            key={property._id} 
            property={property} 
            onClick={() => handlePropertyClick(property._id)}
          />
        ))}
      </div>
    </div>
  );
}
