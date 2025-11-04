import { Booking, LeaveType, BookingStatus } from "@/types/booking";

const STORAGE_KEY = "line_liff_bookings";

// เก็บข้อมูลการจองใน localStorage (สำหรับ demo)
// ใน production ควรใช้ backend API
export const getBookings = (): Booking[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get bookings:", error);
    return [];
  }
};

export const saveBooking = (
  booking: Omit<Booking, "id" | "createdAt">
): Booking => {
  const bookings = getBookings();

  const newBooking: Booking = {
    ...booking,
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error("Failed to save booking:", error);
    throw error;
  }

  return newBooking;
};

export const deleteBooking = (bookingId: string): boolean => {
  const bookings = getBookings();
  const filtered = bookings.filter((b) => b.id !== bookingId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return false;
  }
};

export const updateBookingStatus = (
  bookingId: string,
  status: BookingStatus
): boolean => {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) return false;

  booking.status = status;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch (error) {
    console.error("Failed to update booking:", error);
    return false;
  }
};

export const getBookingsByDate = (date: string): Booking[] => {
  const bookings = getBookings();
  return bookings.filter((b) => b.date === date);
};

export const getBookingsByMonth = (year: number, month: number): Booking[] => {
  const bookings = getBookings();
  return bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return (
      bookingDate.getFullYear() === year && bookingDate.getMonth() === month
    );
  });
};

export const getLeaveTypeLabel = (type: LeaveType): string => {
  const labels: Record<LeaveType, string> = {
    sick: "ลาป่วย",
    vacation: "ลาพักผ่อน",
    personal: "ลากิจ",
    other: "อื่นๆ",
  };
  return labels[type] || type;
};

export const getStatusLabel = (status: BookingStatus): string => {
  const labels: Record<BookingStatus, string> = {
    pending: "รออนุมัติ",
    approved: "อนุมัติ",
    rejected: "ปฏิเสธ",
  };
  return labels[status];
};

export const getStatusColor = (status: BookingStatus): string => {
  const colors: Record<BookingStatus, string> = {
    pending: "#ff9800",
    approved: "#4caf50",
    rejected: "#f44336",
  };
  return colors[status];
};
