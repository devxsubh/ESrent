import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Coupon } from '@/lib/models/couponSchema';
import { UserService } from '@/lib/services/userService';

// GET - List all coupons (admin only) or validate a coupon code
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    // If code is provided, validate it (public endpoint)
    if (code) {
      const coupon = await Coupon.findByCode(code);
      
      if (!coupon) {
        return NextResponse.json(
          { success: false, error: 'Coupon code not found' },
          { status: 404 }
        );
      }
      
      // Check if coupon is valid
      const now = new Date();
      let isValid = coupon.isActive;
      
      if (coupon.validFrom > now) {
        isValid = false;
      }
      if (coupon.validUntil && coupon.validUntil < now) {
        isValid = false;
      }
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        isValid = false;
      }
      
      return NextResponse.json({
        success: true,
        data: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          isValid,
        },
      });
    }
    
    // Otherwise, list all coupons (admin only)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const user = await UserService.verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: coupons,
    });
    
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const user = await UserService.verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.code || !body.discountType || body.discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: code, discountType, discountValue' },
        { status: 400 }
      );
    }
    
    // Validate discount value
    if (body.discountType === 'percentage' && (body.discountValue < 0 || body.discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    if (body.discountType === 'fixed' && body.discountValue < 0) {
      return NextResponse.json(
        { success: false, error: 'Fixed discount must be greater than or equal to 0' },
        { status: 400 }
      );
    }
    
    // Check if code already exists
    const existingCoupon = await Coupon.findByCode(body.code);
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    // Create coupon
    const coupon = new Coupon({
      code: body.code.toUpperCase().trim(),
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minDays: body.minDays,
      minPrice: body.minPrice,
      applicableCarModels: body.applicableCarModels || [],
      applicableBrands: body.applicableBrands || [],
      maxUses: body.maxUses,
      maxUsesPerUser: body.maxUsesPerUser,
      isActive: body.isActive !== undefined ? body.isActive : true,
      validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      currentUses: 0,
    });
    
    await coupon.save();
    
    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
