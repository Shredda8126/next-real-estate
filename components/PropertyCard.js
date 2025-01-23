'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Slider from 'react-slick';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaRegClock, FaEdit, FaTrash } from 'react-icons/fa';
import { BiBuildingHouse } from 'react-icons/bi';
import { formatCurrency } from '@/lib/currencyFormat';
import { useRouter } from 'next/navigation';

// Import slick carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function PropertyCard({ 
  property, 
  isOwner = false,  
  currentUserId = null 
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [showCarousel, setShowCarousel] = useState(false);

  // Determine if the current user is the owner
  const canModify = isOwner || 
    (property.owner?._id && property.owner._id === currentUserId);

  const handleEdit = () => {
    router.push(`/properties/edit/${property._id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this property?");
    
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/properties/${property._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete property");
        }

        // Refresh the page or remove the property from the list
        router.refresh();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete property. Please try again.");
      }
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <>
      <div className="group relative bg-white rounded-[20px] shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image Section */}
        <div 
          className="relative h-[280px] cursor-pointer overflow-hidden"
          onClick={() => setShowCarousel(true)}
        >
          <Slider {...sliderSettings} className="property-slider h-full">
            {property.images.map((image, index) => (
              <div key={index} className="relative h-[280px]">
                <Image
                  src={image}
                  alt={`${property.title} - Image ${index + 1}`}
                  fill
                  className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            ))}
          </Slider>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#050b2c]/95 text-white rounded-full text-sm font-medium flex items-center gap-1.5">
              <BiBuildingHouse className="h-4 w-4" />
              {property.propertyType}
            </span>
            <span className="px-3 py-1.5 bg-[#ffa509]/95 text-white rounded-full text-sm font-medium flex items-center gap-1.5">
              <FaRegClock className="h-4 w-4" />
              New
            </span>
          </div>

          {/* Owner Actions Overlay */}
          {canModify && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={handleEdit}
                className="bg-[#ffa509] text-[#050b2c] p-2 rounded-full hover:bg-[#ff9100] transition-colors"
                title="Edit Property"
              >
                <FaEdit />
              </button>
              <button 
                onClick={handleDelete}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                title="Delete Property"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title and Price */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-xl font-bold text-[#050b2c] line-clamp-1 flex-1">
                {property.title}
              </h3>
              <div className="text-[#ffa509] font-bold text-xl">
                {formatCurrency(property.price || 0)}
              </div>
            </div>
            <p className="text-gray-600 flex items-center text-sm">
              <FaMapMarkerAlt className="mr-1.5 text-[#ffa509]" />
              {property.location}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
            <div className="flex flex-col items-center text-center">
              <FaBed className="h-6 w-6 text-[#ffa509] mb-1" />
              <span className="text-lg font-semibold text-[#050b2c]">{property.features.bedrooms}</span>
              <span className="text-xs text-gray-500">Bedrooms</span>
            </div>
            <div className="flex flex-col items-center text-center border-x border-gray-100 px-2">
              <FaBath className="h-6 w-6 text-[#ffa509] mb-1" />
              <span className="text-lg font-semibold text-[#050b2c]">{property.features.bathrooms}</span>
              <span className="text-xs text-gray-500">Bathrooms</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <FaRuler className="h-6 w-6 text-[#ffa509] mb-1" />
              <span className="text-lg font-semibold text-[#050b2c]">{property.features.area}</span>
              <span className="text-xs text-gray-500">Sq Ft</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <Link
              href={`/properties/${property._id}`}
              className="w-full bg-gradient-to-r from-[#050b2c] to-[#0a1854] text-white py-3 rounded-xl text-center font-medium hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              View Details
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Full Screen Carousel Modal */}
      {showCarousel && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowCarousel(false)}
            className="absolute top-6 right-6 text-white/90 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-full max-w-5xl">
            <Slider {...sliderSettings} className="full-screen-slider">
              {property.images.map((image, index) => (
                <div key={index} className="relative h-[75vh]">
                  <Image
                    src={image}
                    alt={`${property.title} - Image ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </>
  );
}
