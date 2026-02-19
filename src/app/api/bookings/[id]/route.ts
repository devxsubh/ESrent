import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Booking from '@/lib/models/bookingSchema';

function getIdFromRequest(request: NextRequest): string {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 1];
}

// GET single booking by ID
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const id = getIdFromRequest(request);
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // visibleId is like "ES-MLT7VIXS-G33L"; MongoDB _id is 24-char hex — try the right lookup first to avoid CastError
    const isMongoId = /^[a-fA-F0-9]{24}$/.test(id);
    let booking = null;
    if (isMongoId) {
      booking = await Booking.findById(id).lean();
    }
    if (!booking) {
      booking = await Booking.findOne({ visibleId: id }).lean();
    }
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Generate WhatsApp link using the booking instance
    const bookingDoc = await Booking.findById(booking._id) || await Booking.findOne({ visibleId: id });
    const whatsappLink = bookingDoc ? bookingDoc.getWhatsAppLink() : '';
    
    // Format dates for response
    const formattedStartDate = booking.startDate 
      ? new Date(booking.startDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '';
    const formattedEndDate = booking.endDate
      ? new Date(booking.endDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '';
    
    // Format response to match BookingConfirmation interface
    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking._id?.toString() || '',
        visibleId: booking.visibleId,
        carName: booking.carName,
        carImage: booking.carImage,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalDays: booking.totalDays,
        pricePerDay: booking.pricePerDay,
        totalPrice: booking.totalPrice,
        pickupLocation: booking.pickupLocation,
        deliveryRequired: booking.deliveryRequired || false,
        customerName: booking.fullName,
        phone: booking.phone,
        whatsappLink,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PATCH update booking (status, admin notes, etc.)
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const id = getIdFromRequest(request);
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;

    const isMongoId = /^[a-fA-F0-9]{24}$/.test(id);
    let booking = null;
    if (isMongoId) {
      booking = await Booking.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }
    if (!booking) {
      booking = await Booking.findOneAndUpdate(
        { visibleId: id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE booking
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const id = getIdFromRequest(request);
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const isMongoId = /^[a-fA-F0-9]{24}$/.test(id);
    let booking = null;
    if (isMongoId) {
      booking = await Booking.findByIdAndDelete(id);
    }
    if (!booking) {
      booking = await Booking.findOneAndDelete({ visibleId: id });
    }
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}






