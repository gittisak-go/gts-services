-- สร้างตาราง bookings สำหรับเก็บข้อมูลการจองวันลา
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  end_date DATE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('domestic', 'international')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- สร้างตาราง users สำหรับเก็บข้อมูลผู้ใช้
CREATE TABLE IF NOT EXISTS users (
  line_user_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  line_display_name TEXT,
  line_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- สร้างตาราง booking_history สำหรับเก็บประวัติการสร้าง แก้ไข และลบ
CREATE TABLE IF NOT EXISTS booking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  booking_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  old_data JSONB,
  new_data JSONB,
  booking_data JSONB
);

-- สร้าง indexes เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_end_date ON bookings(end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_category ON bookings(category);
CREATE INDEX IF NOT EXISTS idx_history_booking_id ON booking_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON booking_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON booking_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_history_action ON booking_history(action);

-- สร้าง function สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับอัปเดต updated_at เมื่อมีการแก้ไข
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับให้ทุกคนอ่านข้อมูลได้ (สำหรับ public access)
CREATE POLICY "Allow public read access on bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on bookings"
  ON bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on bookings"
  ON bookings FOR DELETE
  USING (true);

-- สร้าง policy สำหรับ users
CREATE POLICY "Allow public read access on users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- สร้าง policy สำหรับ booking_history
CREATE POLICY "Allow public read access on booking_history"
  ON booking_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on booking_history"
  ON booking_history FOR INSERT
  WITH CHECK (true);

