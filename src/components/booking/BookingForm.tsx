'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Truck, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard,
  Car,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { 
  PICKUP_LOCATIONS, 
  LICENSE_TYPES, 
  COMMON_NATIONALITIES,
  calculateTotalDays,
  calculateTotalPrice,
  type PickupLocation,
  type LicenseType,
  type BookingFormData,
} from '@/types/booking';

interface CarInfo {
  id: string;
  name: string;
  image?: string;
  pricePerDay: number;
  brand?: string;
  category?: string;
}

interface BookingFormProps {
  car: CarInfo;
  onSuccess?: (confirmation: BookingConfirmationData) => void;
}

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

export function BookingForm({ car, onSuccess }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ensure pricePerDay has a valid value
  const pricePerDay = car.pricePerDay || 0;
  
  // Form state - using Date objects for calendar
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [pickupLocation, setPickupLocation] = useState<PickupLocation>('airport');
  const [deliveryRequired, setDeliveryRequired] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('');
  const [licenseType, setLicenseType] = useState<LicenseType>('international');
  
  // Calculate pricing
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    // Convert Date objects to ISO strings for the calculation
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    return calculateTotalDays(startStr, endStr);
  }, [startDate, endDate]);
  
  const totalPrice = useMemo(() => {
    return calculateTotalPrice(pricePerDay, totalDays);
  }, [pricePerDay, totalDays]);
  
  // Get today's date (for disabling past dates)
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  
  // Validate form
  const isValid = useMemo(() => {
    return (
      startDate &&
      endDate &&
      pickupLocation &&
      fullName.trim().length >= 2 &&
      phone.trim().length >= 8 &&
      nationality &&
      licenseType &&
      (!deliveryRequired || deliveryAddress.trim().length > 0)
    );
  }, [startDate, endDate, pickupLocation, fullName, phone, nationality, licenseType, deliveryRequired, deliveryAddress]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert Date objects to ISO strings for API
      const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
      const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';
      
      const bookingData: BookingFormData = {
        carId: car.id,
        carName: car.name,
        carImage: car.image,
        pricePerDay: pricePerDay,
        startDate: startDateStr,
        endDate: endDateStr,
        pickupLocation,
        deliveryRequired,
        deliveryAddress: deliveryRequired ? deliveryAddress : undefined,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        nationality,
        licenseType,
      };
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }
      
      // Store booking data in sessionStorage and redirect to confirmation page
      sessionStorage.setItem('bookingConfirmation', JSON.stringify(result.data));
      
      // Call onSuccess callback if provided (for backward compatibility)
      if (onSuccess) {
        onSuccess(result.data);
      }
      
      // Redirect to confirmation page
      window.location.href = `/booking/confirmation/${result.data.visibleId}`;
      
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      
      {/* Car Summary Card */}
      <div className="bg-card rounded-xl border border-border/50 p-4 flex gap-4">
        {car.image && (
          <div className="w-24 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={car.image}
              alt={car.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{car.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary font-bold">
              AED {pricePerDay.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">/ day</span>
          </div>
        </div>
      </div>
      
      {/* Section 1: Rental Period */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <span>Rental Period</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pick-up Date */}
          <div className="space-y-2">
            <Label>Pick-up Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "EEE, MMM d, yyyy") : "Select pick-up date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    // If end date is before or same as start date, clear it
                    if (date && endDate && date >= endDate) {
                      setEndDate(undefined);
                    }
                  }}
                  disabled={(date) => date < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Return Date */}
          <div className="space-y-2">
            <Label>Return Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "EEE, MMM d, yyyy") : "Select return date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => {
                    // Disable dates before today or before/equal to start date
                    if (date < today) return true;
                    if (startDate && date <= startDate) return true;
                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {totalDays > 0 && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {totalDays} {totalDays === 1 ? 'day' : 'days'} × AED {pricePerDay.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-primary">
                AED {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Section 2: Location & Delivery */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Location & Delivery</span>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pickupLocation">Pick-up Location *</Label>
          <Select value={pickupLocation} onValueChange={(v) => setPickupLocation(v as PickupLocation)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PICKUP_LOCATIONS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Free Delivery</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll deliver the car to your location
              </p>
            </div>
          </div>
          <Switch
            checked={deliveryRequired}
            onCheckedChange={setDeliveryRequired}
          />
        </div>
        
        {deliveryRequired && (
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address *</Label>
            <Input
              id="deliveryAddress"
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your delivery address"
              required={deliveryRequired}
              className="bg-background"
            />
          </div>
        )}
      </div>
      
      {/* Section 3: Customer Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <User className="w-5 h-5 text-primary" />
          <span>Your Information</span>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="bg-background"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone (WhatsApp) *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 XX XXX XXXX"
              required
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-background"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Nationality *
            </Label>
            <Select value={nationality} onValueChange={setNationality}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_NATIONALITIES.map((nat) => (
                  <SelectItem key={nat} value={nat}>
                    {nat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="licenseType" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              License Type *
            </Label>
            <Select value={licenseType} onValueChange={(v) => setLicenseType(v as LicenseType)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select license type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LICENSE_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Booking Summary */}
      {totalDays > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Booking Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Car</span>
              <span className="font-medium">{car.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">AED {pricePerDay.toLocaleString()} / day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup</span>
              <span className="font-medium">{PICKUP_LOCATIONS[pickupLocation]}</span>
            </div>
            {deliveryRequired && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-green-500">Free</span>
              </div>
            )}
            <div className="border-t border-primary/20 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total (Pay on Pickup)</span>
                <span className="text-2xl font-bold text-primary">
                  AED {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* No Payment Notice */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-600">No Advance Payment Required</p>
          <p className="text-sm text-muted-foreground mt-1">
            Pay securely when you pick up the car. Zero deposit on economy vehicles.
          </p>
        </div>
      </div>
      
      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg font-semibold"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirm Booking – Pay on Pickup
          </>
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        By confirming, you agree to our Terms of Service and Privacy Policy.
        Our team will contact you on WhatsApp to confirm your booking.
      </p>
    </form>
  );
}

