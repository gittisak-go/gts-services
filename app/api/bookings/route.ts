import { NextRequest, NextResponse } from "next/server";
import {
  getBookingsByDate,
  saveBooking,
  updateBooking,
  deleteBooking,
  validateBooking,
  validateCanEdit,
} from "@/lib/booking";
import type { LeaveCategory } from "@/types/booking";

// GET /api/bookings?date=YYYY-MM-DD - Get bookings by date
// GET /api/bookings?year=YYYY&month=MM - Get bookings by month (0-indexed month)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (date) {
      const bookings = await getBookingsByDate(date);
      return NextResponse.json(bookings);
    }

    if (year && month !== null) {
      const { getBookingsByMonth } = await import("@/lib/booking");
      const bookings = await getBookingsByMonth(
        parseInt(year, 10),
        parseInt(month, 10)
      );
      return NextResponse.json(bookings);
    }

    return NextResponse.json(
      { error: "Either date or year+month parameters are required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in GET /api/bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking, validate } = body;

    if (!booking) {
      return NextResponse.json(
        { error: "booking data is required" },
        { status: 400 }
      );
    }

    // Validate if requested
    if (validate !== false) {
      const validation = await validateBooking(
        booking.userId,
        booking.date,
        booking.endDate || booking.date,
        booking.category as LeaveCategory
      );

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || "Validation failed" },
          { status: 400 }
        );
      }
    }

    const newBooking = await saveBooking(booking);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings - Update booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, updates, validate } = body;

    if (!bookingId || !updates) {
      return NextResponse.json(
        { error: "bookingId and updates are required" },
        { status: 400 }
      );
    }

    // Validate if requested
    if (validate !== false) {
      // Need to fetch existing booking to get userId for validation
      const { supabase } = await import("@/lib/supabase");
      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("user_id, date")
        .eq("id", bookingId)
        .single();

      if (existingBooking) {
        const canEdit = validateCanEdit(existingBooking.date);
        if (!canEdit.valid) {
          return NextResponse.json(
            { error: canEdit.error || "Cannot edit this booking" },
            { status: 400 }
          );
        }
      }
    }

    const updatedBooking = await updateBooking(bookingId, updates);
    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Error in PUT /api/bookings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings?id=bookingId
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { error: "id parameter is required" },
        { status: 400 }
      );
    }

    const success = await deleteBooking(bookingId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/bookings:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
