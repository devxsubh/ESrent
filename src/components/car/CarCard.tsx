'use client'

import Link from 'next/link';
import Image from 'next/image';
import { CardContent } from "@/components/ui/card";
import { Car } from '@/types/car';
import { Tilt } from '@/components/ui/tilt';
import { Spotlight } from '@/components/ui/spotlight';

interface CarCardProps {
  car: Car;
  onClick?: () => void;
  brandName?: string;
  seater?: number;
  className?: string;
  linkHref?: string;
  carTypeNames?: string[];
  transmissionNames?: string[];
  fuelTypeNames?: string[];
  tagNames?: string[];
}

export function CarCard({ car, onClick, linkHref, carTypeNames = [], transmissionNames = [], fuelTypeNames = [], tagNames = [] }: CarCardProps) {
  const href = linkHref || `/car/${car.id}`;

  // Safely get the first image or use a fallback
  const carImage = car.images && car.images.length > 0 ? car.images[0] : '/images/luxury-car-bg.jpg';
  
  // Safely construct car name
  const carName = car.name || `${car.brand || 'Unknown'} ${car.model || 'Model'}`;
  
  // Safely get car details with fallbacks
  const carSeat = car.seater || '';
  const carType = carTypeNames[0] || '';
  const carTransmission = transmissionNames[0] || '';
  const carFuel = fuelTypeNames[0] || '';
  const carPrice = car.discountedPrice || car.originalPrice || 0;
  const carOriginalPrice = car.originalPrice || 0;
  const hasDiscount = car.discountedPrice && car.discountedPrice < car.originalPrice;
  const carBrand = car.brand || '';


  const cardContent = (
    <CardContent className="p-0">
      <div className="relative overflow-hidden rounded-xl bg-black">
        <div className="aspect-[16/9] w-full h-[320px]">
          <Image
            src={carImage}
            alt={carName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // Fallback to a default image if the car image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/images/luxury-car-bg.jpg';
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="absolute bottom-0 w-full p-5 space-y-1">
            <h3 className="text-heading-3 text-white">{carName}</h3>
            <div className="flex items-center gap-2 text-sm text-white/70">
              {carBrand && <span>{carBrand}</span>}
              {carType && carBrand && <span>•</span>}
              {carType && <span>{carType}</span>}
              {carSeat && (carType || carBrand) && <span>•</span>}
              {carSeat && <span>{carSeat} seater</span>}
            </div>
            {tagNames.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-primary pt-1">
                {tagNames.map((tag, idx) => (
                  <span key={tag + idx} className="bg-primary/10 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
            <div className="flex items-baseline gap-1 pt-2">
              {hasDiscount ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-primary text-heading-3">AED {carPrice.toLocaleString()}</span>
                  <span className="text-white/60 text-sm line-through">AED {carOriginalPrice.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-primary text-heading-3">AED {carPrice.toLocaleString()}</span>
              )}
              <span className="text-white/60 text-sm">/day</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  );

  return (
    <Tilt
      rotationFactor={8}
      isRevese
      springOptions={{
        stiffness: 26.7,
        damping: 4.1,
        mass: 0.2,
      }}
      className="group relative"
    >
      <Spotlight
        className="z-10 from-primary/50 via-primary/20 to-transparent blur-2xl"
        size={248}
        springOptions={{
          stiffness: 26.7,
          damping: 4.1,
          mass: 0.2,
        }}
      />
      {onClick ? (
        <Link href={href} onClick={onClick} className="block">
          {cardContent}
        </Link>
      ) : (
        <Link href={href} className="block">
          {cardContent}
        </Link>
      )}
    </Tilt>
  );
}
