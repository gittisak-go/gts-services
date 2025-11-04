export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD format
  userId: string;
  userName: string;
  type: LeaveType;
  reason?: string;
  status: BookingStatus;
  createdAt: string;
}

export type LeaveType = "sick" | "vacation" | "personal" | "other";

export type BookingStatus = "pending" | "approved" | "rejected";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}
