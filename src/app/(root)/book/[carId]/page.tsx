'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '../../home/components/Header';
import { BookingForm } from '@/components/booking/BookingForm';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Shield, Truck, Clock } from 'lucide-react';
import Link from 'next/link';

interface CarData {
  id?: string;
  _id?: string;
  name: string;
  brand?: { name: string };
  category?: { name: string };
  images?: string[];
  originalPrice?: number;
  discountedPrice?: number;
  price?: number; // Fallback
  description?: string;
}

export default function BookingPage() {
  const params = useParams();
  const carId = params.carId as string;
  
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cars/${carId}`);
        
        if (!response.ok) {
          throw new Error('Car not found');
        }
        
        const data = await response.json();
        setCar(data.data || data);
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    
    if (carId) {
      fetchCar();
    }
  }, [carId]);
  
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full p-4">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }
  
  // Error state
  if (error || !car) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full p-4">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Car Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The car you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse All Cars
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  // Booking form state
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 py-8">
        {/* Back Link */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Book Your Rental</h1>
              <p className="text-muted-foreground mt-1">
                Complete the form below to reserve your car. No advance payment needed.
              </p>
            </div>
            
            <BookingForm
              car={{
                id: car.id || car._id || carId,
                name: car.name,
                image: car.images?.[0],
                pricePerDay: car.discountedPrice || car.originalPrice || car.price || 0,
                brand: car.brand?.name,
                category: car.category?.name,
              }}
            />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trust Badges */}
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
              <h3 className="font-semibold">Why Book With Us</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">No Advance Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Pay securely when you pick up
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      We deliver to your location
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Quick Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      Get confirmed within 30 mins
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Deposit Policy */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6">
              <h3 className="font-semibold mb-2">Deposit Policy</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Zero deposit on economy cars
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Reduced deposit on premium vehicles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Refundable security deposit
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our team is available 24/7 to assist you.
              </p>
              <a
                href="https://wa.me/971553553626"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

