export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          line_user_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          line_display_name: string | null;
          line_picture_url: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          line_user_id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          line_display_name?: string | null;
          line_picture_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          line_user_id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          line_display_name?: string | null;
          line_picture_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          date: string;
          end_date: string | null;
          user_id: string;
          user_name: string;
          category: "domestic" | "international";
          reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          end_date?: string | null;
          user_id: string;
          user_name: string;
          category: "domestic" | "international";
          reason?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          end_date?: string | null;
          user_id?: string;
          user_name?: string;
          category?: "domestic" | "international";
          reason?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      booking_history: {
        Row: {
          id: string;
          action: "create" | "update" | "delete";
          booking_id: string;
          user_id: string;
          user_name: string;
          timestamp: string;
          old_data: Json | null;
          new_data: Json | null;
          booking_data: Json | null;
        };
        Insert: {
          id?: string;
          action: "create" | "update" | "delete";
          booking_id: string;
          user_id: string;
          user_name: string;
          timestamp?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          booking_data?: Json | null;
        };
        Update: {
          id?: string;
          action?: "create" | "update" | "delete";
          booking_id?: string;
          user_id?: string;
          user_name?: string;
          timestamp?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          booking_data?: Json | null;
        };
      };
    };
  };
}
