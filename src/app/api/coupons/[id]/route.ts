import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Coupon } from '@/lib/models/couponSchema';
import { UserService } from '@/lib/services/userService';

// GET - Get a single coupon by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: coupon,
    });
    
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

// PATCH - Update a coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const body = await request.json();
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    // Validate discount value if being updated
    if (body.discountValue !== undefined) {
      const discountType = body.discountType || coupon.discountType;
      if (discountType === 'percentage' && (body.discountValue < 0 || body.discountValue > 100)) {
        return NextResponse.json(
          { success: false, error: 'Percentage discount must be between 0 and 100' },
          { status: 400 }
        );
      }
      if (discountType === 'fixed' && body.discountValue < 0) {
        return NextResponse.json(
          { success: false, error: 'Fixed discount must be greater than or equal to 0' },
          { status: 400 }
        );
      }
    }
    
    // Check if code is being changed and if it already exists
    if (body.code && body.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findByCode(body.code);
      if (existingCoupon && existingCoupon._id.toString() !== id) {
        return NextResponse.json(
          { success: false, error: 'Coupon code already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update fields
    if (body.code) coupon.code = body.code.toUpperCase().trim();
    if (body.description !== undefined) coupon.description = body.description;
    if (body.discountType) coupon.discountType = body.discountType;
    if (body.discountValue !== undefined) coupon.discountValue = body.discountValue;
    if (body.minDays !== undefined) coupon.minDays = body.minDays;
    if (body.minPrice !== undefined) coupon.minPrice = body.minPrice;
    if (body.applicableCarModels !== undefined) coupon.applicableCarModels = body.applicableCarModels;
    if (body.applicableBrands !== undefined) coupon.applicableBrands = body.applicableBrands;
    if (body.maxUses !== undefined) coupon.maxUses = body.maxUses;
    if (body.maxUsesPerUser !== undefined) coupon.maxUsesPerUser = body.maxUsesPerUser;
    if (body.isActive !== undefined) coupon.isActive = body.isActive;
    if (body.validFrom) coupon.validFrom = new Date(body.validFrom);
    if (body.validUntil !== undefined) coupon.validUntil = body.validUntil ? new Date(body.validUntil) : undefined;
    
    await coupon.save();
    
    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
    
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
