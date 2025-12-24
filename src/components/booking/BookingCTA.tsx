'use client';

import Link from 'next/link';
import { Calendar, Shield, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingCTAProps {
  carId: string;
  carName: string;
  pricePerDay: number;
  className?: string;
  variant?: 'default' | 'compact' | 'hero';
}

export function BookingCTA({ 
  carId, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  carName, 
  pricePerDay, 
  className = '',
  variant = 'default'
}: BookingCTAProps) {
  
  if (variant === 'compact') {
    return (
      <Link
        href={`/book/${carId}`}
        className={`inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors ${className}`}
      >
        <Calendar className="w-4 h-4" />
        Book Now
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  }
  
  if (variant === 'hero') {
    return (
      <div className={`bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-6 border border-primary/30 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-3xl font-bold text-primary">
              AED {pricePerDay.toLocaleString()}
              <span className="text-lg font-normal text-muted-foreground"> / day</span>
            </p>
          </div>
        </div>
        
        <Link href={`/book/${carId}`}>
          <Button size="lg" className="w-full h-14 text-lg font-semibold">
            <Calendar className="w-5 h-5 mr-2" />
            Book Now – No Advance Needed
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Zero Deposit</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-blue-500" />
            <span>Free Delivery</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Default variant
  return (
    <div className={`bg-card rounded-xl border border-border/50 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Daily Rate</p>
          <p className="text-2xl font-bold text-primary">
            AED {pricePerDay.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Pay on Pickup</p>
          <p className="text-xs text-green-500">No Advance Required</p>
        </div>
      </div>
      
      <Link href={`/book/${carId}`}>
        <Button size="lg" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Book Now
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Zero Deposit</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="w-4 h-4 text-blue-500" />
          <span>Free Delivery</span>
        </div>
      </div>
    </div>
  );
}

// Quick car category selector for landing page
interface CarCategorySelectorProps {
  onSelect?: (category: string) => void;
  className?: string;
}

export function CarCategorySelector({ onSelect, className = '' }: CarCategorySelectorProps) {
  const categories = [
    { id: 'economy', label: 'Economy', icon: '🚗', description: 'Affordable & efficient' },
    { id: 'premium', label: 'Premium', icon: '🚙', description: 'Comfort & style' },
    { id: 'supercar', label: 'Supercar', icon: '🏎️', description: 'Ultimate luxury' },
  ];
  
  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect?.(cat.id)}
          className="group flex flex-col items-center p-4 bg-card rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <span className="text-3xl mb-2">{cat.icon}</span>
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {cat.label}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {cat.description}
          </span>
        </button>
      ))}
    </div>
  );
}

