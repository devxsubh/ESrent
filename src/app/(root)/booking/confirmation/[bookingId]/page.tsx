'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../../home/components/Header';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BookingConfirmationData {
  bookingId: string;
  visibleId: string;
  carName: string;
  carImage?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalPrice: number;
  pickupLocation: string;
  deliveryRequired: boolean;
  customerName: string;
  phone: string;
  whatsappLink: string;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<BookingConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if booking data is in sessionStorage (from redirect)
    const storedBooking = sessionStorage.getItem('bookingConfirmation');
    
    if (storedBooking) {
      try {
        const bookingData = JSON.parse(storedBooking);
        setBooking(bookingData);
        setLoading(false);
        // Clear from sessionStorage after reading
        sessionStorage.removeItem('bookingConfirmation');
        
        // Track conversion in Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with your GA4 conversion ID
            'value': bookingData.totalPrice,
            'currency': 'AED',
            'transaction_id': bookingData.visibleId,
          });
        }
      } catch (err) {
        console.error('Error parsing stored booking:', err);
        setError('Invalid booking data');
        setLoading(false);
      }
    } else {
      // If no stored data, try to fetch from API using bookingId
      if (bookingId) {
        fetchBooking();
      } else {
        setError('Booking ID is required');
        setLoading(false);
      }
    }
  }, [bookingId]);
  
  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`);
      
      if (!response.ok) {
        throw new Error('Booking not found');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setBooking(result.data);
      } else {
        throw new Error(result.error || 'Booking not found');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }
  
  // Error state
  if (error || !booking) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Booking Not Found</h1>
            <p className="text-gray-400 mb-6">
              {error || 'The booking you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <div className="flex gap-4">
              <Link href="/">
                <Button className="bg-[#44caad] hover:bg-[#3ab89a]">
                  Back to Home
                </Button>
              </Link>
              <Link href="/cars">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Browse Cars
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Confirmation state
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 py-8">
        <BookingConfirmation booking={booking} />
      </main>
    </div>
  );
}

