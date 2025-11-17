import { NextRequest, NextResponse } from "next/server";
import { validateBooking } from "@/lib/booking";
import type { LeaveCategory } from "@/types/booking";

// POST /api/bookings/validate - Validate booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, startDate, endDate, category, excludeBookingId } = body;

    if (!userId || !startDate || !category) {
      return NextResponse.json(
        { error: "userId, startDate, and category are required" },
        { status: 400 }
      );
    }

    const validation = await validateBooking(
      userId,
      startDate,
      endDate || startDate,
      category as LeaveCategory,
      excludeBookingId
    );

    return NextResponse.json(validation);
  } catch (error) {
    console.error("Error in POST /api/bookings/validate:", error);
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
