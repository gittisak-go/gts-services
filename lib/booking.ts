import { Booking, LeaveCategory } from "@/types/booking";

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
    id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
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

export const updateBooking = (
  bookingId: string,
  updates: Partial<Omit<Booking, "id" | "userId" | "userName" | "createdAt">>
): Booking | null => {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) return null;

  Object.assign(booking, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return booking;
  } catch (error) {
    console.error("Failed to update booking:", error);
    return null;
  }
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

export const getBookingsByDate = (date: string): Booking[] => {
  const bookings = getBookings();
  return bookings.filter((b) => {
    if (b.date === date) return true;
    if (b.endDate) {
      const start = new Date(b.date);
      const end = new Date(b.endDate);
      const checkDate = new Date(date);
      return checkDate >= start && checkDate <= end;
    }
    return false;
  });
};

// Helper: Get all dates in a range
export const getDatesInRange = (
  startDate: string,
  endDate: string
): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
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

export const getLeaveCategoryLabel = (category: LeaveCategory): string => {
  const labels: Record<LeaveCategory, string> = {
    domestic: "ในประเทศ",
    international: "นอกประเทศ",
  };
  return labels[category];
};

export const getMaxDays = (category: LeaveCategory): number => {
  return category === "domestic" ? 7 : 9;
};

// Validation functions
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ตรวจสอบว่าวันนั้นมีคนจองเกิน 2 คนหรือยัง
export const validateDateCapacity = (
  date: string,
  excludeBookingId?: string
): ValidationResult => {
  const bookings = getBookingsByDate(date);
  const filtered = excludeBookingId
    ? bookings.filter((b) => b.id !== excludeBookingId)
    : bookings;

  if (filtered.length >= 2) {
    return {
      valid: false,
      error: "วันนี้มีการจองครบ 2 คนแล้ว",
    };
  }

  return { valid: true };
};

// ตรวจสอบว่าลาหลายวันเกินจำนวนที่กำหนดหรือไม่
export const validateMaxDays = (
  startDate: string,
  endDate: string,
  category: LeaveCategory
): ValidationResult => {
  const dates = getDatesInRange(startDate, endDate);
  const days = dates.length;
  const maxDays = getMaxDays(category);

  if (days > maxDays) {
    return {
      valid: false,
      error: `ลาประเภท${getLeaveCategoryLabel(
        category
      )}สามารถลาสูงสุด ${maxDays} วัน (คุณลาทั้งหมด ${days} วัน)`,
    };
  }

  return { valid: true };
};

// ตรวจสอบว่าคนนี้ลาหลายเดือนเกิน 1 ครั้งหรือยัง
export const validateMonthlyLimit = (
  userId: string,
  date: string,
  excludeBookingId?: string
): ValidationResult => {
  const bookings = getBookings();
  const bookingDate = new Date(date);
  const year = bookingDate.getFullYear();
  const month = bookingDate.getMonth();

  const userBookings = bookings.filter((b) => {
    if (b.userId !== userId) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    const bDate = new Date(b.date);
    return bDate.getFullYear() === year && bDate.getMonth() === month;
  });

  if (userBookings.length >= 1) {
    return {
      valid: false,
      error: "เดือนนี้คุณได้ขอลาแล้ว (1 เดือนสามารถขอลาได้เพียง 1 ครั้ง)",
    };
  }

  return { valid: true };
};

// ตรวจสอบว่าผ่านวันแล้วหรือยัง (สำหรับแก้ไข)
export const validateCanEdit = (bookingDate: string): ValidationResult => {
  const {
    getTodayBangkok,
    parseDateString,
    getStartOfDayBangkok,
  } = require("@/lib/dateUtils");
  const today = getTodayBangkok();
  const date = getStartOfDayBangkok(parseDateString(bookingDate));

  if (date < today) {
    return {
      valid: false,
      error: "ไม่สามารถแก้ไขการจองที่ผ่านวันไปแล้ว",
    };
  }

  return { valid: true };
};

// ตรวจสอบทุกอย่างรวมกัน
export const validateBooking = (
  userId: string,
  startDate: string,
  endDate: string,
  category: LeaveCategory,
  excludeBookingId?: string
): ValidationResult => {
  // ตรวจสอบจำนวนวันสูงสุด
  const maxDaysCheck = validateMaxDays(startDate, endDate, category);
  if (!maxDaysCheck.valid) return maxDaysCheck;

  // ตรวจสอบว่าทุกวันมีคนจองเกิน 2 คนหรือยัง
  const dates = getDatesInRange(startDate, endDate);
  for (const date of dates) {
    const capacityCheck = validateDateCapacity(date, excludeBookingId);
    if (!capacityCheck.valid) {
      return {
        valid: false,
        error: `วันที่ ${date} ${capacityCheck.error}`,
      };
    }
  }

  // ตรวจสอบว่าลาหลายเดือนเกิน 1 ครั้งหรือยัง
  const monthlyCheck = validateMonthlyLimit(
    userId,
    startDate,
    excludeBookingId
  );
  if (!monthlyCheck.valid) return monthlyCheck;

  return { valid: true };
};
