import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  
  // Discount details
  discountType: 'percentage' | 'fixed';
  discountValue: number; // Percentage (0-100) or fixed amount in AED
  
  // Conditions
  minDays?: number; // Minimum rental days required
  minPrice?: number; // Minimum total price required
  applicableCarModels?: string[]; // Array of car model names
  applicableBrands?: string[]; // Array of car brands
  
  // Usage limits
  maxUses?: number; // Maximum number of times coupon can be used
  maxUsesPerUser?: number; // Maximum uses per user (by phone/email)
  currentUses: number; // Current number of times used
  
  // Validity
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date; // Optional expiry date
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface CouponModel extends Model<ICoupon> {
  findByCode(code: string): Promise<ICoupon | null>;
  findActive(): Promise<ICoupon[]>;
  isValid(coupon: ICoupon): boolean;
}

const couponSchema = new Schema<ICoupon, CouponModel>(
  {
    code: {
      type: String,
      required: true,
      unique: true, // creates unique index; no separate index: true to avoid duplicate
      uppercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[A-Z0-9_-]+$/.test(v);
        },
        message: 'Coupon code must contain only uppercase letters, numbers, hyphens, and underscores'
      }
    },
    description: {
      type: String,
      trim: true,
    },
    
    // Discount details
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed'],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(this: ICoupon, v: number) {
          if (this.discountType === 'percentage') {
            return v >= 0 && v <= 100;
          }
          return v >= 0;
        },
        message: 'Percentage discount must be between 0 and 100'
      }
    },
    
    // Conditions
    minDays: {
      type: Number,
      min: 1,
    },
    minPrice: {
      type: Number,
      min: 0,
    },
    applicableCarModels: [{
      type: String,
      trim: true,
    }],
    applicableBrands: [{
      type: String,
      trim: true,
    }],
    
    // Usage limits
    maxUses: {
      type: Number,
      min: 1,
    },
    maxUsesPerUser: {
      type: Number,
      min: 1,
    },
    currentUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Validity
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
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

// Indexes for efficient queries (code already indexed via unique: true)
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ createdAt: -1 });

// Static method to find by code
couponSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase() });
};

// Static method to find active coupons (usage limit filtered in app code if needed)
couponSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: null },
      { validUntil: { $gte: now } },
    ],
  });
};

// Static method to check if coupon is valid
couponSchema.statics.isValid = function(coupon: ICoupon) {
  if (!coupon.isActive) return false;
  
  const now = new Date();
  if (coupon.validFrom > now) return false;
  if (coupon.validUntil && coupon.validUntil < now) return false;
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) return false;
  
  return true;
};

// Instance method to calculate discount amount
couponSchema.methods.calculateDiscount = function(originalPrice: number): number {
  if (this.discountType === 'percentage') {
    return Math.round((originalPrice * this.discountValue) / 100);
  } else {
    return Math.min(this.discountValue, originalPrice); // Don't exceed original price
  }
};

// Export model
export const Coupon: CouponModel = 
  mongoose.models.Coupon as CouponModel || 
  mongoose.model<ICoupon, CouponModel>('Coupon', couponSchema);
