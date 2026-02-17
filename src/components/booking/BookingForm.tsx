'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Ticket,
  X,
  ChevronDown,
  Info,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponSearchValue, setCouponSearchValue] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Array<{
    code: string;
    description?: string | null;
    discountLabel: string;
    conditionsText: string;
    applicable: boolean;
  }>>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponDropdownOpen, setCouponDropdownOpen] = useState(false);
  const [allCouponsDialogOpen, setAllCouponsDialogOpen] = useState(false);
  const [allCouponsList, setAllCouponsList] = useState<Array<{
    code: string;
    description?: string | null;
    discountLabel: string;
    conditionsText: string;
    applicable: boolean;
  }>>([]);
  
  // Calculate pricing
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    // Convert Date objects to ISO strings for the calculation
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    return calculateTotalDays(startStr, endStr);
  }, [startDate, endDate]);
  
  const basePrice = useMemo(() => {
    return calculateTotalPrice(pricePerDay, totalDays);
  }, [pricePerDay, totalDays]);
  
  const totalPrice = useMemo(() => {
    if (appliedCoupon) {
      return Math.max(0, basePrice - appliedCoupon.discountAmount);
    }
    return basePrice;
  }, [basePrice, appliedCoupon]);
  
  // Get today's date (for disabling past dates)
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  
  const validateCoupon = () => {
    console.log(`\n🔘 Apply button clicked for coupon: "${couponCode}"`);
    if (!couponCode.trim()) {
      console.log('❌ No coupon code entered');
      setCouponError(null);
      setAppliedCoupon(null);
      return;
    }
    if (!startDate || !endDate || totalDays === 0) {
      console.log('❌ Dates not selected or invalid');
      setCouponError('Please select rental dates first');
      return;
    }
    validateCouponWithCode(couponCode.trim());
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Fetch applicable coupons when booking context is ready
  useEffect(() => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔄 FETCHING AVAILABLE COUPONS (Frontend)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Booking Context:', {
      totalDays,
      basePrice: `AED ${basePrice.toLocaleString()}`,
      carModel: car.name,
      carBrand: car.brand || 'Not specified',
    });
    
    if (totalDays > 0 && basePrice > 0) {
      console.log('✅ Booking context is ready, fetching coupons...');
      setLoadingCoupons(true);
      const params = new URLSearchParams({
        totalDays: String(totalDays),
        totalPrice: String(basePrice),
        carModel: car.name,
        carBrand: car.brand || '',
      });
      console.log('Request URL:', `/api/coupons/available?${params}`);
      
      fetch(`/api/coupons/available?${params}`)
        .then((res) => res.json())
        .then((result) => {
          console.log('📦 Response received:', result);
          if (result.success && result.data) {
            const applicable = result.data.filter((c: any) => c.applicable);
            const notApplicable = result.data.filter((c: any) => !c.applicable);
            console.log(`✅ Found ${result.data.length} coupons:`);
            console.log(`   - ${applicable.length} applicable`);
            console.log(`   - ${notApplicable.length} not applicable`);
            if (applicable.length > 0) {
              console.log('   Applicable coupons:', applicable.map((c: any) => c.code).join(', '));
            }
            if (notApplicable.length > 0) {
              console.log('   Not applicable:', notApplicable.map((c: any) => `${c.code} (${c.conditionsText})`).join(', '));
            }
            setAvailableCoupons(result.data);
          } else {
            console.log('❌ No coupons returned or request failed');
            setAvailableCoupons([]);
          }
        })
        .catch((err) => {
          console.error('❌ Error fetching coupons:', err);
          setAvailableCoupons([]);
        })
        .finally(() => {
          setLoadingCoupons(false);
          console.log('═══════════════════════════════════════════════════════════\n');
        });
    } else {
      console.log('⏳ Waiting for booking context (dates and price)...');
      setAvailableCoupons([]);
    }
  }, [totalDays, basePrice, car.name, car.brand]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!couponDropdownOpen) {
      setCouponSearchValue('');
    }
  }, [couponDropdownOpen]);

  const openAllCouponsDialog = () => {
    setAllCouponsDialogOpen(true);
    fetch('/api/coupons/available')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) setAllCouponsList(result.data);
        else setAllCouponsList([]);
      })
      .catch(() => setAllCouponsList([]));
  };

  const applyCouponFromDropdown = (code: string) => {
    console.log(`\n🎯 Applying coupon from dropdown: "${code}"`);
    setCouponCode(code);
    setCouponDropdownOpen(false);
    setCouponError(null);
    validateCouponWithCode(code);
  };

  const validateCouponWithCode = (code: string) => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔍 VALIDATING COUPON (Frontend)');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (!code.trim()) {
      console.log('❌ No coupon code provided');
      return;
    }
    if (!startDate || !endDate) {
      console.log('❌ Dates not selected');
      return;
    }
    if (totalDays === 0) {
      console.log('❌ Invalid date range (0 days)');
      return;
    }
    
    setValidatingCoupon(true);
    setCouponError(null);
    
    const validationData = {
      code: code.toUpperCase().trim(),
      totalDays,
      totalPrice: basePrice,
      carModel: car.name,
      carBrand: car.brand || undefined, // Send undefined instead of empty string
    };
    
    console.log('📤 Sending validation request:', {
      code: validationData.code,
      totalDays: validationData.totalDays,
      totalPrice: `AED ${validationData.totalPrice.toLocaleString()}`,
      carModel: validationData.carModel,
      carBrand: validationData.carBrand || 'Not specified',
    });
    
    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validationData),
    })
      .then(async (res) => {
        const result = await res.json();
        console.log('\n📥 Validation response received:');
        console.log('   HTTP Status:', res.status);
        console.log('   Response:', result);
        
        if (!res.ok) {
          // HTTP error status
          const errorMsg = result.error || `Validation failed (${res.status})`;
          console.log(`\n❌ VALIDATION FAILED: ${errorMsg}`);
          console.log('═══════════════════════════════════════════════════════════\n');
          setCouponError(errorMsg);
          setAppliedCoupon(null);
          return;
        }
        
        if (result.success) {
          console.log(`\n✅ VALIDATION SUCCESSFUL!`);
          console.log('   Coupon:', result.data.code);
          console.log('   Discount:', `AED ${result.data.discountAmount.toLocaleString()}`);
          console.log('   Original Price:', `AED ${result.data.originalPrice.toLocaleString()}`);
          console.log('   Final Price:', `AED ${result.data.finalPrice.toLocaleString()}`);
          console.log('═══════════════════════════════════════════════════════════\n');
          setAppliedCoupon({
            code: result.data.code,
            discountAmount: result.data.discountAmount,
            description: result.data.description,
          });
          setCouponError(null);
        } else {
          const errorMsg = result.error || 'Invalid coupon';
          console.log(`\n❌ VALIDATION FAILED: ${errorMsg}`);
          console.log('═══════════════════════════════════════════════════════════\n');
          setCouponError(errorMsg);
          setAppliedCoupon(null);
        }
      })
      .catch((err) => {
        console.error('\n❌ NETWORK ERROR:', err);
        console.log('═══════════════════════════════════════════════════════════\n');
        setCouponError('Could not validate coupon. Please try again.');
        setAppliedCoupon(null);
      })
      .finally(() => setValidatingCoupon(false));
  };

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
      
      const bookingData: BookingFormData & { carBrand?: string } = {
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
        couponCode: appliedCoupon?.code,
        couponDiscountAmount: appliedCoupon?.discountAmount,
        carBrand: car.brand,
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
                AED {basePrice.toLocaleString()}
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
      
      {/* Coupon + Booking Summary */}
      {totalDays > 0 && (
        <div className="space-y-4">
          {/* Coupon – highlighted near summary */}
          <div className="rounded-xl p-4 border-2 border-amber-500/40 bg-amber-500/5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-foreground">Coupon Code</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="font-semibold text-green-600">Applied: {appliedCoupon.code}</span>
                  </div>
                  {appliedCoupon.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{appliedCoupon.description}</p>
                  )}
                  <p className="text-sm font-medium text-green-600">Discount: AED {appliedCoupon.discountAmount.toLocaleString()}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={removeCoupon} className="text-destructive hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover open={couponDropdownOpen} onOpenChange={setCouponDropdownOpen}>
                    <PopoverTrigger asChild>
                      <div
                        role="combobox"
                        aria-expanded={couponDropdownOpen}
                        className="relative flex-1 min-w-0 flex items-center"
                      >
                        <Input
                          placeholder="Enter code or pick one below"
                          value={couponCode}
                          onClick={() => {
                            if (availableCoupons.length > 0) {
                              setCouponDropdownOpen(true);
                            }
                          }}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              validateCoupon();
                            }
                          }}
                          onFocus={() => {
                            if (availableCoupons.length > 0) {
                              setCouponDropdownOpen(true);
                            }
                          }}
                          className="bg-background border-amber-500/30 focus-visible:ring-amber-500/50 pr-10 cursor-text flex-1 min-w-0"
                          disabled={validatingCoupon}
                        />
                        {availableCoupons.length > 0 && (
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors z-10 pointer-events-auto"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCouponDropdownOpen(!couponDropdownOpen);
                            }}
                          >
                            <ChevronDown className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              couponDropdownOpen && "rotate-180"
                            )} />
                          </button>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[min(450px,100vw)] p-0" 
                      align="start"
                      side="bottom"
                      sideOffset={4}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search coupons..."
                          value={couponSearchValue}
                          onChange={(e) => setCouponSearchValue(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                      <div className="max-h-[280px] overflow-y-auto p-1">
                        {loadingCoupons ? (
                          <div className="p-4 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (() => {
                          const filtered = availableCoupons.filter((c) => {
                            if (!couponSearchValue.trim()) return true;
                            const search = couponSearchValue.toLowerCase();
                            return (
                              c.code.toLowerCase().includes(search) ||
                              (c.description && c.description.toLowerCase().includes(search)) ||
                              c.discountLabel.toLowerCase().includes(search)
                            );
                          });
                          if (filtered.length === 0) {
                            return (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No coupons found.
                              </div>
                            );
                          }
                          return filtered.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCouponCode(c.code);
                                setCouponSearchValue('');
                                setCouponDropdownOpen(false);
                                setCouponError(null);
                                applyCouponFromDropdown(c.code);
                              }}
                              className={cn(
                                "w-full text-left flex flex-col items-start gap-1 py-3 px-3 rounded-md cursor-pointer transition-colors",
                                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                                !c.applicable && "opacity-60"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">{c.code}</span>
                                <span className="text-xs text-primary font-medium">{c.discountLabel}</span>
                              </div>
                              {c.description && (
                                <span className="text-xs text-muted-foreground">{c.description}</span>
                              )}
                              {c.conditionsText && c.conditionsText !== 'No conditions' && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Info className="w-3 h-3" />
                                  {c.conditionsText}
                                </span>
                              )}
                            </button>
                          ));
                        })()}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    onClick={validateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="sm:w-auto"
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableCoupons.length > 0 && (
                    <span className="text-xs text-muted-foreground">Click field to see coupons for this booking</span>
                  )}
                  <button
                    type="button"
                    onClick={openAllCouponsDialog}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    View all coupons & conditions
                  </button>
                </div>
                {couponError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {couponError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Booking Summary */}
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
            {appliedCoupon && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">AED {basePrice.toLocaleString()}</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span className="text-muted-foreground">Discount ({appliedCoupon.code})</span>
                <span className="font-medium">- AED {appliedCoupon.discountAmount.toLocaleString()}</span>
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
        </div>
      )}

      {/* All Coupons popup */}
      <Dialog open={allCouponsDialogOpen} onOpenChange={setAllCouponsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              All available coupons
            </DialogTitle>
            <DialogDescription>
              Conditions apply. Select dates and car to see which coupons apply to your booking.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2 -mr-2">
            {allCouponsList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No coupons available at the moment.</p>
            ) : (
              <ul className="space-y-3">
                {allCouponsList.map((c) => (
                  <li
                    key={c.code}
                    className="rounded-lg border border-border/50 p-3 bg-card"
                  >
                    <div className="font-semibold text-foreground">{c.code}</div>
                    <div className="text-sm text-primary font-medium mt-0.5">{c.discountLabel}</div>
                    {c.description && (
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{c.conditionsText || 'No conditions'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
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

