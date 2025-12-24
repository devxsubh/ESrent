'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Car, 
  Phone,
  MessageCircle,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { PICKUP_LOCATIONS, type PickupLocation } from '@/types/booking';

interface BookingConfirmationProps {
  booking: {
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
  };
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(booking.visibleId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const pickupLocationLabel = PICKUP_LOCATIONS[booking.pickupLocation as PickupLocation] || booking.pickupLocation;
  
  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Booking Request Received!
          </h1>
          <p className="text-muted-foreground mt-2">
            Your booking request has been received. Our team will contact you on WhatsApp shortly.
          </p>
        </div>
      </div>
      
      {/* Booking ID */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Booking ID</p>
            <p className="text-xl font-bold font-mono">{booking.visibleId}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyBookingId}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Booking Summary Card */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {/* Car Image */}
        {booking.carImage && (
          <div className="relative h-48 w-full">
            <Image
              src={booking.carImage}
              alt={booking.carName}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-xl font-bold text-white">{booking.carName}</h2>
            </div>
          </div>
        )}
        
        {/* Booking Details */}
        <div className="p-6 space-y-4">
          {!booking.carImage && (
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <Car className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">{booking.carName}</h2>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                <span>Pick-up</span>
              </div>
              <p className="font-semibold">{booking.startDate}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                <span>Return</span>
              </div>
              <p className="font-semibold">{booking.endDate}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>Pickup Location</span>
            </div>
            <p className="font-semibold">{pickupLocationLabel}</p>
            {booking.deliveryRequired && (
              <span className="inline-flex items-center text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full mt-1">
                Free Delivery Included
              </span>
            )}
          </div>
          
          <div className="border-t border-border/50 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'} × AED {booking.pricePerDay.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay on Pickup • No Advance Required
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  AED {booking.totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* WhatsApp CTA */}
      <div className="space-y-4">
        <a
          href={booking.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span>Chat Now on WhatsApp</span>
          <ArrowRight className="w-5 h-5" />
        </a>
        
        <p className="text-center text-sm text-muted-foreground">
          Get instant confirmation by chatting with our team
        </p>
      </div>
      
      {/* What Happens Next */}
      <div className="bg-card rounded-xl border border-border/50 p-6">
        <h3 className="font-semibold mb-4">What happens next?</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium">Confirmation Call</p>
              <p className="text-sm text-muted-foreground">
                Our team will contact you on WhatsApp within 30 minutes to confirm your booking.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium">Document Verification</p>
              <p className="text-sm text-muted-foreground">
                Share your driving license and passport/Emirates ID via WhatsApp.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium">Car Delivery</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll deliver the car to your location or you can pick it up from our office.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <a href="tel:+971XXXXXXXXX" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Phone className="w-4 h-4" />
          <span>+971 XX XXX XXXX</span>
        </a>
      </div>
      
      {/* Back to Home */}
      <div className="text-center">
        <Link href="/" className="text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

