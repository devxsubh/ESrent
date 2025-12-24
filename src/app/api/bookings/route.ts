import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Booking from '@/lib/models/bookingSchema';

// GET all bookings (admin) or by phone (customer lookup)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    if (phone) {
      query.phone = phone;
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);
    
    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST create new booking
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'carId',
      'carName',
      'pricePerDay',
      'startDate',
      'endDate',
      'pickupLocation',
      'fullName',
      'phone',
      'nationality',
      'licenseType',
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return NextResponse.json(
        { success: false, error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }
    
    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    // Calculate total days and price
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalPrice = body.pricePerDay * totalDays;
    
    // Generate unique visible ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const visibleId = `ES-${timestamp}-${random}`;
    
    // Create booking
    const bookingDoc = new Booking({
      visibleId,
      carId: body.carId,
      carName: body.carName,
      carImage: body.carImage,
      pricePerDay: body.pricePerDay,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      pickupLocation: body.pickupLocation,
      deliveryRequired: body.deliveryRequired || false,
      deliveryAddress: body.deliveryAddress,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      nationality: body.nationality,
      licenseType: body.licenseType,
      status: 'pending',
      notes: body.notes,
    });
    
    await bookingDoc.save();
    
    // Generate WhatsApp link
    const whatsappLink = bookingDoc.getWhatsAppLink();
    
    // Format dates for response
    const formattedStartDate = startDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedEndDate = endDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: bookingDoc._id?.toString() || '',
        visibleId: bookingDoc.visibleId,
        carName: bookingDoc.carName,
        carImage: bookingDoc.carImage,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalDays: bookingDoc.totalDays,
        pricePerDay: bookingDoc.pricePerDay,
        totalPrice: bookingDoc.totalPrice,
        pickupLocation: bookingDoc.pickupLocation,
        deliveryRequired: bookingDoc.deliveryRequired,
        customerName: bookingDoc.fullName,
        phone: bookingDoc.phone,
        whatsappLink,
        status: bookingDoc.status,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

