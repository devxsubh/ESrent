'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FaWhatsapp } from "react-icons/fa"
import { useCarHire } from '@/hooks/useCarHire';

interface CarPricingProps {
  car: {
    name: string
    year: number
    transmission: string
    engineCapacity: string
    fuelType: string
    seats: number
    originalPrice?: number
    discountedPrice?: number
  }
  selectedDate: string
  endDate: string
}

export function CarPricing({ car, selectedDate, endDate }: CarPricingProps) {
  // We'll keep the props for backward compatibility, but also use context
  const { pickupDate, dropoffDate } = useCarHire()
  
  // Use context values if props are empty
  const effectivePickupDate = selectedDate || pickupDate
  const effectiveEndDate = endDate || dropoffDate
  
  // Get the effective price (discounted if available, otherwise original)
  const effectivePrice = car.discountedPrice || car.originalPrice || 0
  const hasDiscount = car.discountedPrice && car.discountedPrice < (car.originalPrice || 0)
  
  const calculateTotalPrice = () => {
    if (effectivePickupDate && effectiveEndDate && effectivePrice) {
      const pickupDate = new Date(effectivePickupDate);
      const returnDate = new Date(effectiveEndDate);
      const days = Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)));
      return { total: effectivePrice * days, days };
    }
    return null;
  };

  const totalPrice = calculateTotalPrice();

  const whatsappMessage = `Hi, I'm interested in the ${car.name} (${car.year}) listed on ES Rentals.%0A%0ADetails:%0A- Transmission: ${car.transmission}%0A- Engine: ${car.engineCapacity}%0A- Fuel Type: ${car.fuelType}%0A- Seats: ${car.seats}${effectivePickupDate ? `%0A- Pickup: ${new Date(effectivePickupDate).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}` : ''}${effectiveEndDate ? `%0A- Return: ${new Date(effectiveEndDate).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}` : ''}${totalPrice ? `%0A- Total Price: AED ${totalPrice.total.toLocaleString()} for ${totalPrice.days} day${totalPrice.days > 1 ? 's' : ''}` : ''}%0A%0ACould you please provide more information about this vehicle?`;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 z-20 shadow-2xl rounded-t-2xl">
      <div className="flex items-center justify-between mb-2 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-md font-semibold text-white">
              {effectivePrice ? `AED ${effectivePrice.toLocaleString()}/Day` : 'Price on request'}
            </span>
            {hasDiscount && car.originalPrice && (
              <span className="text-sm text-white/60 line-through">
                AED {car.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {totalPrice ? (
            <span className="text-sm font-medium text-white">
              Total: AED {totalPrice.total.toLocaleString()} for {totalPrice.days} day{totalPrice.days > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-xs font-medium text-white/70">
              {!effectivePickupDate ? 'Select pickup date to proceed' : !effectiveEndDate ? 'Select return date to proceed' : ''}
            </span>
          )}
        </div>
        
        <Link 
          href={`https://wa.me/971553553626?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button 
            className={cn(
              "bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg px-8 py-3 text-lg font-bold",
              (!effectivePickupDate || !effectiveEndDate) && "opacity-50 cursor-not-allowed"
            )}
            disabled={!effectivePickupDate || !effectiveEndDate}
          >
            <FaWhatsapp className="mr-1" /> Book Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
