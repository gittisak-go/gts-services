// Shared data transformation utilities to reduce code duplication
import { Booking } from "@/types/booking";

/**
 * Transform Supabase row to Booking object
 * Reduces code duplication across the codebase
 */
export const transformSupabaseRowToBooking = (row: any): Booking => ({
  id: row.id,
  date: row.date,
  endDate: row.end_date || undefined,
  userId: row.user_id,
  userName: row.user_name,
  category: row.category,
  reason: row.reason || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at || undefined,
});

/**
 * Transform array of Supabase rows to Booking objects
 */
export const transformSupabaseRowsToBookings = (rows: any[]): Booking[] => {
  return rows.map(transformSupabaseRowToBooking);
};
