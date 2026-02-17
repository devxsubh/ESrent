import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBooking extends Document {
  visibleId: string;
  
  // Car & Duration
  carId: mongoose.Types.ObjectId;
  carName: string;
  carImage?: string;
  pricePerDay: number;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  originalPrice?: number;
  couponCode?: string;
  couponDiscountAmount?: number;
  
  // Location & Delivery
  pickupLocation: string;
  deliveryRequired: boolean;
  deliveryAddress?: string;
  
  // Customer Info
  fullName: string;
  phone: string;
  email?: string;
  nationality: string;
  licenseType: 'uae' | 'international';
  
  // Status & Meta
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  adminNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface IBookingMethods {
  getWhatsAppLink(): string;
}

interface BookingModel extends Model<IBooking, object, IBookingMethods> {
  findByVisibleId(visibleId: string): Promise<IBooking | null>;
  findByPhone(phone: string): Promise<IBooking[]>;
  findByStatus(status: string): Promise<IBooking[]>;
  getUpcoming(): Promise<IBooking[]>;
}

const bookingSchema = new Schema<IBooking, BookingModel, IBookingMethods>(
  {
    visibleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Car & Duration
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    carName: {
      type: String,
      required: true,
      trim: true,
    },
    carImage: {
      type: String,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    
    // Coupon Information
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    couponDiscountAmount: {
      type: Number,
      min: 0,
    },
    
    // Location & Delivery
    pickupLocation: {
      type: String,
      required: true,
      enum: ['airport', 'marina', 'jlt', 'downtown', 'business-bay', 'palm-jumeirah', 'other'],
    },
    deliveryRequired: {
      type: Boolean,
      default: false,
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    
    // Customer Info
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    licenseType: {
      type: String,
      required: true,
      enum: ['uae', 'international'],
    },
    
    // Status & Meta
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = String(ret._id);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Generate unique visible ID before saving
bookingSchema.pre('save', async function (next) {
  if (!this.visibleId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.visibleId = `ES-${timestamp}-${random}`;
  }
  
  // Calculate total days and price
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    this.totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const basePrice = this.pricePerDay * this.totalDays;
    
    // Store original price before discount
    if (!this.originalPrice) {
      this.originalPrice = basePrice;
    }
    
    // Apply coupon discount if exists
    if (this.couponDiscountAmount && this.couponDiscountAmount > 0) {
      this.totalPrice = Math.max(0, basePrice - this.couponDiscountAmount);
    } else {
      this.totalPrice = basePrice;
    }
  }
  
  next();
});

// Instance method to generate WhatsApp link
bookingSchema.methods.getWhatsAppLink = function (): string {
  const businessPhone = '971553553626'; // +971 55 355 3626
  const startDate = this.startDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const endDate = this.endDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  const message = encodeURIComponent(
    `Hi! I just made a booking on ES Rent A Car.\n\n` +
    `📋 Booking ID: ${this.visibleId}\n` +
    `🚗 Car: ${this.carName}\n` +
    `📅 Dates: ${startDate} to ${endDate}\n` +
    `📍 Pickup: ${this.pickupLocation}\n` +
    `${this.couponCode ? `🎫 Coupon: ${this.couponCode}\n` : ''}` +
    `💰 Total: AED ${this.totalPrice.toLocaleString()}${this.couponDiscountAmount ? ` (Discount: AED ${this.couponDiscountAmount.toLocaleString()})` : ''}\n\n` +
    `Please confirm my booking. Thank you!`
  );
  
  return `https://wa.me/${businessPhone}?text=${message}`;
};

// Static methods
bookingSchema.statics.findByVisibleId = function (visibleId: string) {
  return this.findOne({ visibleId });
};

bookingSchema.statics.findByPhone = function (phone: string) {
  return this.find({ phone }).sort({ createdAt: -1 });
};

bookingSchema.statics.findByStatus = function (status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

bookingSchema.statics.getUpcoming = function () {
  return this.find({
    status: { $in: ['pending', 'confirmed'] },
    startDate: { $gte: new Date() },
  }).sort({ startDate: 1 });
};

// Indexes for efficient queries
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ carId: 1, startDate: 1 });

// Export model
const Booking: BookingModel = 
  mongoose.models.Booking as BookingModel || 
  mongoose.model<IBooking, BookingModel>('Booking', bookingSchema);

export default Booking;

