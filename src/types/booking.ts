// Booking Types for ES Rent A Car

export type CarCategory = 'economy' | 'premium' | 'supercar';

export type PickupLocation = 
  | 'airport' 
  | 'marina' 
  | 'jlt' 
  | 'downtown' 
  | 'business-bay'
  | 'palm-jumeirah'
  | 'other';

export type LicenseType = 'uae' | 'international';

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed';

export interface BookingFormData {
  // Car & Duration
  carId: string;
  carName: string;
  carImage?: string;
  pricePerDay: number;
  startDate: string;
  endDate: string;
  
  // Location & Delivery
  pickupLocation: PickupLocation;
  deliveryRequired: boolean;
  deliveryAddress?: string;
  
  // Customer Info
  fullName: string;
  phone: string;
  email?: string;
  nationality: string;
  licenseType: LicenseType;
  
  // Calculated
  totalDays?: number;
  totalPrice?: number;
}

export interface Booking extends BookingFormData {
  id: string;
  visibleId: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  adminNotes?: string;
}

export interface BookingConfirmation {
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

// Pickup location display names
export const PICKUP_LOCATIONS: Record<PickupLocation, string> = {
  'airport': 'Dubai International Airport (DXB)',
  'marina': 'Dubai Marina',
  'jlt': 'JLT (Jumeirah Lake Towers)',
  'downtown': 'Downtown Dubai',
  'business-bay': 'Business Bay',
  'palm-jumeirah': 'Palm Jumeirah',
  'other': 'Other Location',
};

// License type display names
export const LICENSE_TYPES: Record<LicenseType, string> = {
  'uae': 'UAE Driving License',
  'international': 'International Driving Permit',
};

// Common nationalities for dropdown
export const COMMON_NATIONALITIES = [
  'United Arab Emirates',
  'India',
  'Pakistan',
  'Philippines',
  'United Kingdom',
  'United States',
  'Saudi Arabia',
  'Egypt',
  'Jordan',
  'Lebanon',
  'Bangladesh',
  'Sri Lanka',
  'Nepal',
  'Russia',
  'Germany',
  'France',
  'Italy',
  'China',
  'Australia',
  'Canada',
  'Other',
];

// Helper functions
export function calculateTotalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays); // Minimum 1 day
}

export function calculateTotalPrice(pricePerDay: number, totalDays: number): number {
  return pricePerDay * totalDays;
}

export function generateWhatsAppLink(booking: BookingConfirmation): string {
  const phone = '+971XXXXXXXXX'; // Replace with actual business WhatsApp number
  const message = encodeURIComponent(
    `Hi! I just made a booking on ES Rent A Car.\n\n` +
    `📋 Booking ID: ${booking.visibleId}\n` +
    `🚗 Car: ${booking.carName}\n` +
    `📅 Dates: ${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}\n` +
    `📍 Pickup: ${booking.pickupLocation}\n` +
    `💰 Total: AED ${booking.totalPrice.toLocaleString()}\n\n` +
    `Please confirm my booking. Thank you!`
  );
  return `https://wa.me/${phone}?text=${message}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function generateBookingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ES-${timestamp}-${random}`;
}

