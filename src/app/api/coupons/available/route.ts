import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Coupon } from '@/lib/models/couponSchema';

/**
 * GET /api/coupons/available
 * Public endpoint: returns active coupons with conditions (for checkout display).
 * Optional query: totalDays, totalPrice, carModel, carBrand to filter applicable ones.
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const totalDays = request.nextUrl.searchParams.get('totalDays');
    const totalPrice = request.nextUrl.searchParams.get('totalPrice');
    const carModel = request.nextUrl.searchParams.get('carModel') || '';
    const carBrand = request.nextUrl.searchParams.get('carBrand') || '';

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 FETCHING AVAILABLE COUPONS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Request Parameters:', {
      totalDays: totalDays ? Number(totalDays) : 'not provided',
      totalPrice: totalPrice ? Number(totalPrice) : 'not provided',
      carModel: carModel || 'not provided',
      carBrand: carBrand || 'not provided',
    });

    const now = new Date();
    console.log('Current date/time:', now.toISOString());

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      $or: [
        { validUntil: { $exists: false } },
        { validUntil: null },
        { validUntil: { $gte: now } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`\n✅ Found ${coupons.length} active coupons from database`);

    // Filter by usage limit in JS
    const filtered = (coupons as any[]).filter((c) => {
      if (c.maxUses == null) return true;
      const canUse = (c.currentUses || 0) < c.maxUses;
      if (!canUse) {
        console.log(`  ❌ ${c.code}: Usage limit reached (${c.currentUses}/${c.maxUses})`);
      }
      return canUse;
    });

    console.log(`✅ ${filtered.length} coupons passed usage limit check\n`);

    const numTotalDays = totalDays ? Number(totalDays) : null;
    const numTotalPrice = totalPrice ? Number(totalPrice) : null;

    const list = filtered.map((c: any) => {
      const conditions: string[] = [];
      if (c.minDays) conditions.push(`Min ${c.minDays} days`);
      if (c.minPrice) conditions.push(`Min AED ${Number(c.minPrice).toLocaleString()}`);
      if (c.applicableCarModels?.length) conditions.push(`Models: ${c.applicableCarModels.join(', ')}`);
      if (c.applicableBrands?.length) conditions.push(`Brands: ${c.applicableBrands.join(', ')}`);

      let applicable = true;
      const reasons: string[] = [];

      // Check minimum days
      if (c.minDays) {
        if (!numTotalDays) {
          applicable = false;
          reasons.push(`Min days check skipped (no totalDays provided)`);
        } else if (numTotalDays < c.minDays) {
          applicable = false;
          reasons.push(`Days: ${numTotalDays} < ${c.minDays} (required)`);
        } else {
          reasons.push(`✅ Days: ${numTotalDays} >= ${c.minDays} (PASS)`);
        }
      }

      // Check minimum price
      if (c.minPrice) {
        if (!numTotalPrice) {
          applicable = false;
          reasons.push(`Min price check skipped (no totalPrice provided)`);
        } else if (numTotalPrice < c.minPrice) {
          applicable = false;
          reasons.push(`Price: ${numTotalPrice} < ${c.minPrice} (required)`);
        } else {
          reasons.push(`✅ Price: ${numTotalPrice} >= ${c.minPrice} (PASS)`);
        }
      }

      // Check car model restrictions
      if (c.applicableCarModels && Array.isArray(c.applicableCarModels) && c.applicableCarModels.length > 0) {
        if (!carModel) {
          applicable = false;
          reasons.push(`Model: No car model provided, but coupon requires: ${c.applicableCarModels.join(', ')}`);
        } else if (!c.applicableCarModels.includes(carModel)) {
          applicable = false;
          reasons.push(`Model: "${carModel}" not in allowed list: [${c.applicableCarModels.join(', ')}]`);
        } else {
          reasons.push(`✅ Model: "${carModel}" matches allowed list (PASS)`);
        }
      } else {
        reasons.push(`✅ Model: No restrictions (applies to all)`);
      }

      // Check brand restrictions
      if (c.applicableBrands && Array.isArray(c.applicableBrands) && c.applicableBrands.length > 0) {
        if (!carBrand) {
          applicable = false;
          reasons.push(`Brand: No car brand provided, but coupon requires: ${c.applicableBrands.join(', ')}`);
        } else if (!c.applicableBrands.includes(carBrand)) {
          applicable = false;
          reasons.push(`Brand: "${carBrand}" not in allowed list: [${c.applicableBrands.join(', ')}]`);
        } else {
          reasons.push(`✅ Brand: "${carBrand}" matches allowed list (PASS)`);
        }
      } else {
        reasons.push(`✅ Brand: No restrictions (applies to all)`);
      }

      console.log(`\n🎫 Coupon: ${c.code}`);
      console.log(`   Conditions: ${conditions.length ? conditions.join(', ') : 'None'}`);
      console.log(`   Status: ${applicable ? '✅ APPLICABLE' : '❌ NOT APPLICABLE'}`);
      reasons.forEach(reason => console.log(`   ${reason}`));

      const discountLabel =
        c.discountType === 'percentage'
          ? `${c.discountValue}% OFF`
          : `AED ${c.discountValue} OFF`;

      return {
        code: c.code,
        description: c.description || null,
        discountType: c.discountType,
        discountValue: c.discountValue,
        discountLabel,
        conditions,
        conditionsText: conditions.length ? conditions.join(' • ') : 'No conditions',
        applicable,
      };
    });

    const applicableCount = list.filter(c => c.applicable).length;
    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`📊 SUMMARY: ${applicableCount}/${list.length} coupons are applicable`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('❌ Error fetching available coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}
