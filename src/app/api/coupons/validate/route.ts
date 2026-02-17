import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Coupon } from '@/lib/models/couponSchema';

// POST - Validate a coupon code with booking details
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { code, totalDays, totalPrice, carModel, carBrand } = body;
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔍 VALIDATING COUPON');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Request Data:', {
      code: code || 'MISSING',
      totalDays: totalDays !== undefined ? Number(totalDays) : 'MISSING',
      totalPrice: totalPrice !== undefined ? Number(totalPrice) : 'MISSING',
      carModel: carModel || 'MISSING',
      carBrand: carBrand || 'MISSING',
    });
    
    if (!code) {
      console.log('❌ ERROR: Coupon code is required');
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }
    
    const coupon = await Coupon.findByCode(code);
    
    if (!coupon) {
      console.log(`❌ ERROR: Coupon "${code}" not found in database`);
      return NextResponse.json(
        { success: false, error: 'Coupon code not found' },
        { status: 404 }
      );
    }
    
    console.log(`\n✅ Coupon "${coupon.code}" found in database`);
    console.log('Coupon Details:', {
      code: coupon.code,
      isActive: coupon.isActive,
      minDays: coupon.minDays ?? 'None',
      minPrice: coupon.minPrice ?? 'None',
      applicableCarModels: coupon.applicableCarModels?.length ? coupon.applicableCarModels : 'All models',
      applicableBrands: coupon.applicableBrands?.length ? coupon.applicableBrands : 'All brands',
      maxUses: coupon.maxUses ?? 'Unlimited',
      currentUses: coupon.currentUses || 0,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil ?? 'No expiry',
    });
    
    console.log('\n🔎 Starting validation checks...\n');
    
    // Check if coupon is active
    console.log(`[1/7] Checking if coupon is active...`);
    if (!coupon.isActive) {
      console.log(`   ❌ FAILED: Coupon is not active`);
      return NextResponse.json(
        { success: false, error: 'Coupon is not active' },
        { status: 400 }
      );
    }
    console.log(`   ✅ PASSED: Coupon is active`);
    
    // Check validity dates
    const now = new Date();
    console.log(`\n[2/7] Checking validity dates...`);
    console.log(`   Current time: ${now.toISOString()}`);
    console.log(`   Valid from: ${coupon.validFrom.toISOString()}`);
    
    if (coupon.validFrom > now) {
      console.log(`   ❌ FAILED: Coupon is not yet valid (starts ${coupon.validFrom.toISOString()})`);
      return NextResponse.json(
        { success: false, error: 'Coupon is not yet valid' },
        { status: 400 }
      );
    }
    console.log(`   ✅ PASSED: Coupon has started`);
    
    if (coupon.validUntil) {
      console.log(`   Valid until: ${coupon.validUntil.toISOString()}`);
      if (coupon.validUntil < now) {
        console.log(`   ❌ FAILED: Coupon has expired (expired ${coupon.validUntil.toISOString()})`);
        return NextResponse.json(
          { success: false, error: 'Coupon has expired' },
          { status: 400 }
        );
      }
      console.log(`   ✅ PASSED: Coupon has not expired`);
    } else {
      console.log(`   ✅ PASSED: No expiry date (valid forever)`);
    }
    
    // Check usage limits
    console.log(`\n[3/7] Checking usage limits...`);
    if (coupon.maxUses) {
      console.log(`   Max uses: ${coupon.maxUses}, Current uses: ${coupon.currentUses || 0}`);
      if (coupon.currentUses >= coupon.maxUses) {
        console.log(`   ❌ FAILED: Usage limit reached (${coupon.currentUses}/${coupon.maxUses})`);
        return NextResponse.json(
          { success: false, error: 'Coupon has reached maximum usage limit' },
          { status: 400 }
        );
      }
      console.log(`   ✅ PASSED: Usage limit not reached`);
    } else {
      console.log(`   ✅ PASSED: No usage limit`);
    }
    
    // Check minimum days requirement
    console.log(`\n[4/7] Checking minimum days requirement...`);
    const numTotalDays = typeof totalDays === 'string' ? parseInt(totalDays, 10) : (totalDays ?? 0);
    if (coupon.minDays !== undefined && coupon.minDays !== null) {
      console.log(`   Required: ${coupon.minDays} days`);
      console.log(`   Provided: ${numTotalDays} days`);
      if (numTotalDays < coupon.minDays) {
        console.log(`   ❌ FAILED: ${numTotalDays} < ${coupon.minDays}`);
        return NextResponse.json(
          { 
            success: false, 
            error: `This coupon requires a minimum of ${coupon.minDays} rental days` 
          },
          { status: 400 }
        );
      }
      console.log(`   ✅ PASSED: ${numTotalDays} >= ${coupon.minDays}`);
    } else {
      console.log(`   ✅ PASSED: No minimum days requirement`);
    }
    
    // Check minimum price requirement
    console.log(`\n[5/7] Checking minimum price requirement...`);
    const numTotalPrice = typeof totalPrice === 'string' ? parseFloat(totalPrice) : (totalPrice ?? 0);
    if (coupon.minPrice !== undefined && coupon.minPrice !== null) {
      console.log(`   Required: AED ${coupon.minPrice.toLocaleString()}`);
      console.log(`   Provided: AED ${numTotalPrice.toLocaleString()}`);
      if (numTotalPrice < coupon.minPrice) {
        console.log(`   ❌ FAILED: ${numTotalPrice} < ${coupon.minPrice}`);
        return NextResponse.json(
          { 
            success: false, 
            error: `This coupon requires a minimum booking value of AED ${coupon.minPrice.toLocaleString()}` 
          },
          { status: 400 }
        );
      }
      console.log(`   ✅ PASSED: ${numTotalPrice} >= ${coupon.minPrice}`);
    } else {
      console.log(`   ✅ PASSED: No minimum price requirement`);
    }
    
    // Check car model restrictions
    console.log(`\n[6/7] Checking car model restrictions...`);
    if (coupon.applicableCarModels && Array.isArray(coupon.applicableCarModels) && coupon.applicableCarModels.length > 0) {
      const carModelStr = carModel ? String(carModel).trim() : '';
      console.log(`   Required models: [${coupon.applicableCarModels.join(', ')}]`);
      console.log(`   Provided model: "${carModelStr}"`);
      if (!carModelStr || !coupon.applicableCarModels.includes(carModelStr)) {
        console.log(`   ❌ FAILED: Model "${carModelStr}" not in allowed list`);
        return NextResponse.json(
          { 
            success: false, 
            error: `This coupon is only valid for specific car models: ${coupon.applicableCarModels.join(', ')}` 
          },
          { status: 400 }
        );
      }
      console.log(`   ✅ PASSED: Model matches allowed list`);
    } else {
      console.log(`   ✅ PASSED: No model restrictions (applies to all)`);
    }
    
    // Check brand restrictions
    console.log(`\n[7/7] Checking car brand restrictions...`);
    if (coupon.applicableBrands && Array.isArray(coupon.applicableBrands) && coupon.applicableBrands.length > 0) {
      const carBrandStr = carBrand ? String(carBrand).trim() : '';
      console.log(`   Required brands: [${coupon.applicableBrands.join(', ')}]`);
      console.log(`   Provided brand: "${carBrandStr}"`);
      if (!carBrandStr || !coupon.applicableBrands.includes(carBrandStr)) {
        console.log(`   ❌ FAILED: Brand "${carBrandStr}" not in allowed list`);
        return NextResponse.json(
          { 
            success: false, 
            error: `This coupon is only valid for specific car brands: ${coupon.applicableBrands.join(', ')}` 
          },
          { status: 400 }
        );
      }
      console.log(`   ✅ PASSED: Brand matches allowed list`);
    } else {
      console.log(`   ✅ PASSED: No brand restrictions (applies to all)`);
    }
    
    // Calculate discount amount
    console.log(`\n💰 Calculating discount...`);
    const discountAmount = coupon.discountType === 'percentage'
      ? Math.round((numTotalPrice * coupon.discountValue) / 100)
      : Math.min(coupon.discountValue, numTotalPrice);
    
    const finalPrice = Math.max(0, numTotalPrice - discountAmount);
    
    console.log(`   Original price: AED ${numTotalPrice.toLocaleString()}`);
    console.log(`   Discount type: ${coupon.discountType}`);
    console.log(`   Discount value: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ' AED'}`);
    console.log(`   Discount amount: AED ${discountAmount.toLocaleString()}`);
    console.log(`   Final price: AED ${finalPrice.toLocaleString()}`);
    
    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`✅ VALIDATION SUCCESSFUL - Coupon "${coupon.code}" is applicable!`);
    console.log(`═══════════════════════════════════════════════════════════\n`);
    
    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        originalPrice: numTotalPrice,
        finalPrice,
      },
    });
    
  } catch (error) {
    console.error('\n❌ ERROR validating coupon:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
