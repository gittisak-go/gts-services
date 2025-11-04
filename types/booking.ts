export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format สำหรับการลาหลายวัน
  userId: string;
  userName: string;
  category: LeaveCategory; // ในประเทศ/นอกประเทศ
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}

export type LeaveCategory = "domestic" | "international"; // ในประเทศ / นอกประเทศ

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}
